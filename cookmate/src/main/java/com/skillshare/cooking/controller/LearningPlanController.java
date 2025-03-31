package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.LearningPlan;
import com.skillshare.cooking.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
@CrossOrigin(origins = "http://localhost:5173") // Adjusted for Vite's default port
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    // Create a new learning plan
    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(@RequestBody LearningPlan learningPlan) {
        LearningPlan createdPlan = learningPlanService.createLearningPlan(learningPlan);
        return ResponseEntity.ok(createdPlan);
    }

    // Get all learning plans
    @GetMapping
    public ResponseEntity<List<LearningPlan>> getAllLearningPlans() {
        List<LearningPlan> plans = learningPlanService.getAllLearningPlans();
        return ResponseEntity.ok(plans);
    }

    // Get a learning plan by ID
    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlanById(@PathVariable String id) {
        return learningPlanService.getLearningPlanById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a learning plan by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String id) {
        learningPlanService.deleteLearningPlan(id);
        return ResponseEntity.ok().build();
        }

        @PutMapping("/{id}")
        public ResponseEntity<LearningPlan> updateLearningPlan(@PathVariable String id, @RequestBody LearningPlan learningPlan) {
        LearningPlan updatedPlan = learningPlanService.updateLearningPlan(id, learningPlan);
        return ResponseEntity.ok(updatedPlan);
    }
    
}