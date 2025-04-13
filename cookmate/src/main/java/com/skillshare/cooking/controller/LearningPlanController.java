package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.LearningPlan;
import com.skillshare.cooking.service.LearningPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-plans")
@CrossOrigin(origins = "http://localhost:5173")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<?> getUserLearningPlans(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<LearningPlan> plans = learningPlanService.getUserLearningPlans(userEmail);
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching user learning plans: " + e.getMessage());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicLearningPlans() {
        try {
            List<LearningPlan> plans = learningPlanService.getPublicLearningPlans();
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching public learning plans: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLearningPlanById(@PathVariable String id) {
        try {
            Optional<LearningPlan> plan = learningPlanService.getLearningPlanById(id);
            return plan.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching learning plan by ID: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createLearningPlan(
            @Valid @RequestBody LearningPlan learningPlan,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            LearningPlan createdPlan = learningPlanService.createLearningPlan(learningPlan, userEmail);
            return ResponseEntity.ok(createdPlan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating learning plan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningPlan(
            @PathVariable String id,
            @Valid @RequestBody LearningPlan learningPlan,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            LearningPlan updatedPlan = learningPlanService.updateLearningPlan(id, learningPlan, userEmail);
            return ResponseEntity.ok(updatedPlan);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Learning plan not found or unauthorized: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating learning plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningPlan(
            @PathVariable String id,
            Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            learningPlanService.deleteLearningPlan(id, userEmail);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Learning plan not found or unauthorized: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting learning plan: " + e.getMessage());
        }
    }
}