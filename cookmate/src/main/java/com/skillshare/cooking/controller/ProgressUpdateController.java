package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.ProgressUpdate;
import com.skillshare.cooking.service.LearningPlanService;
import com.skillshare.cooking.service.ProgressUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress-updates")
@CrossOrigin(origins = "http://localhost:5173")
public class ProgressUpdateController {

    @Autowired
    private ProgressUpdateService progressUpdateService;

    @Autowired
    private LearningPlanService learningPlanService;

    @PostMapping
    public ResponseEntity<?> createProgressUpdate(
            @RequestBody ProgressUpdate progressUpdate,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            // Set default values if title or description are missing
            if (progressUpdate.getTitle() == null || progressUpdate.getTitle().isEmpty()) {
                progressUpdate.setTitle("Progress Update");
            }
            if (progressUpdate.getDescription() == null || progressUpdate.getDescription().isEmpty()) {
                progressUpdate.setDescription("Updated progress for learning plan");
            }
            ProgressUpdate createdUpdate = progressUpdateService.createProgressUpdate(progressUpdate, userEmail);

            // Update the learning plan's progress
            learningPlanService.updateProgress(
                    progressUpdate.getPlanId(),
                    progressUpdate.getProgressPercentage(),
                    userEmail
            );

            return ResponseEntity.ok(createdUpdate);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Learning plan not found or unauthorized: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating progress update: " + e.getMessage());
        }
    }

    @GetMapping("/{planId}")
    public ResponseEntity<?> getProgressUpdatesByPlanId(
            @PathVariable String planId,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            List<ProgressUpdate> updates = progressUpdateService.getProgressUpdatesByPlanId(planId, userEmail);
            if (updates.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No progress updates found for the specified plan.");
            }
            return ResponseEntity.ok(updates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching progress updates: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getAllProgressUpdatesForUser(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<ProgressUpdate> updates = progressUpdateService.getAllProgressUpdatesForUser(userEmail);
            if (updates.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No progress updates found for this user.");
            }
            return ResponseEntity.ok(updates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching all progress updates: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgressUpdate(
            @PathVariable String id,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            progressUpdateService.deleteProgressUpdate(id, userEmail);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Progress update not found or unauthorized: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting progress update: " + e.getMessage());
        }
    }
}