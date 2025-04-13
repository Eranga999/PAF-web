
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
@CrossOrigin(origins = "http://localhost:5173")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<List<LearningPlan>> getUserLearningPlans(Authentication authentication) {
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
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        LearningPlan createdPlan = learningPlanService.createLearningPlan(learningPlan, userEmail);
        return ResponseEntity.ok(createdPlan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(
            @PathVariable String id,
            @Valid @RequestBody LearningPlan updatedPlan,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        Optional<LearningPlan> existingPlan = learningPlanService.getLearningPlanById(id);
        if (existingPlan.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LearningPlan plan = existingPlan.get();
        if (!plan.getUserEmail().equals(userEmail)) {
            return ResponseEntity.status(403).build(); // Forbidden
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

        LearningPlan savedPlan = learningPlanService.updateLearningPlan(id, plan, userEmail);
        return ResponseEntity.ok(savedPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(
            @PathVariable String id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        learningPlanService.deleteLearningPlan(id, userEmail);
        return ResponseEntity.ok().build();
    }
}

