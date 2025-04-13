package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.LearningPlan;
import com.skillshare.cooking.service.LearningPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<List<LearningPlan>> getUserLearningPlans(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(null);
        }
        String userEmail = authentication.getName();
        List<LearningPlan> plans = learningPlanService.getUserLearningPlans(userEmail);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/public")
    public ResponseEntity<List<LearningPlan>> getPublicLearningPlans() {
        List<LearningPlan> plans = learningPlanService.getPublicLearningPlans();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlanById(@PathVariable String id) {
        Optional<LearningPlan> plan = learningPlanService.getLearningPlanById(id);
        return plan.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(
            @Valid @RequestBody LearningPlan learningPlan,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(null);
        }
        String userEmail = authentication.getName();
        LearningPlan createdPlan = learningPlanService.createLearningPlan(learningPlan, userEmail);
        return ResponseEntity.ok(createdPlan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(
            @PathVariable String id,
            @Valid @RequestBody LearningPlan updatedPlan,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(null);
        }
        String userEmail = authentication.getName();
        Optional<LearningPlan> existingPlan = learningPlanService.getLearningPlanById(id);
        if (existingPlan.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LearningPlan plan = existingPlan.get();
        if (!plan.getUserEmail().equals(userEmail)) {
            return ResponseEntity.status(403).body(null); // Forbidden
        }

        // Update fields
        plan.setTitle(updatedPlan.getTitle());
        plan.setDescription(updatedPlan.getDescription());
        plan.setTopics(updatedPlan.getTopics());
        plan.setStartDate(updatedPlan.getStartDate());
        plan.setEstimatedEndDate(updatedPlan.getEstimatedEndDate());
        plan.setPublic(updatedPlan.isPublic());

        // Recalculate progress based on topics
        long totalTopics = plan.getTopics().size();
        long completedTopics = plan.getTopics().stream().filter(LearningPlan.Topic::isCompleted).count();
        int progress = totalTopics > 0 ? (int) Math.round((completedTopics * 100.0) / totalTopics) : 0;
        plan.setProgress(progress);

        Optional<LearningPlan> savedPlanOpt = learningPlanService.updateLearningPlan(id, plan, userEmail);
        if (savedPlanOpt.isEmpty()) {
            return ResponseEntity.status(403).body(null); // Unauthorized or plan not found
        }
        return ResponseEntity.ok(savedPlanOpt.get());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(
            @PathVariable String id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String userEmail = authentication.getName();
        boolean deleted = learningPlanService.deleteLearningPlan(id, userEmail);
        if (!deleted) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok().build();
    }
}