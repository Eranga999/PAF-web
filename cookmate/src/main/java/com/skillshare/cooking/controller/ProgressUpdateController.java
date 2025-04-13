package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.ProgressUpdate;
import com.skillshare.cooking.service.ProgressUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping
    public ResponseEntity<ProgressUpdate> createProgressUpdate(
            @RequestBody ProgressUpdate progressUpdate,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        ProgressUpdate createdUpdate = progressUpdateService.createProgressUpdate(progressUpdate, userEmail);
        return ResponseEntity.ok(createdUpdate);
    }

    @GetMapping("/plan/{planId}")
    public ResponseEntity<List<ProgressUpdate>> getProgressUpdatesByPlanId(
            @PathVariable String planId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        List<ProgressUpdate> updates = progressUpdateService.getProgressUpdatesByPlanId(planId, userEmail);
        return ResponseEntity.ok(updates);
    }

    @GetMapping
    public ResponseEntity<List<ProgressUpdate>> getAllProgressUpdates(
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        List<ProgressUpdate> updates = progressUpdateService.getAllProgressUpdates(userEmail);
        return ResponseEntity.ok(updates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgressUpdate(
            @PathVariable String id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        progressUpdateService.deleteProgressUpdate(id, userEmail);
        return ResponseEntity.ok().build();
    }
}