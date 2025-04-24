package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.ProgressUpdate;
import com.skillshare.cooking.service.ProgressUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress-updates")
@CrossOrigin(origins = "http://localhost:5173") 
public class ProgressUpdateController {

    @Autowired
    private ProgressUpdateService progressUpdateService;

    @PostMapping
    public ResponseEntity<ProgressUpdate> createProgressUpdate(@RequestBody ProgressUpdate progressUpdate) {
        ProgressUpdate createdUpdate = progressUpdateService.createProgressUpdate(progressUpdate);
        return ResponseEntity.ok(createdUpdate);
    }

    @GetMapping
    public ResponseEntity<List<ProgressUpdate>> getAllProgressUpdates() {
        List<ProgressUpdate> updates = progressUpdateService.getAllProgressUpdates();
        return ResponseEntity.ok(updates);
    }

    @GetMapping("/plan/{planId}")
    public ResponseEntity<List<ProgressUpdate>> getProgressUpdatesByPlanId(@PathVariable String planId) {
        List<ProgressUpdate> updates = progressUpdateService.getProgressUpdatesByPlanId(planId);
        return ResponseEntity.ok(updates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgressUpdate(@PathVariable String id) {
        progressUpdateService.deleteProgressUpdate(id);
        return ResponseEntity.ok().build();
    }
}