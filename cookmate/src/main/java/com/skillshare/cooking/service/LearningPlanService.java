package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.LearningPlan;
import com.skillshare.cooking.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public LearningPlan createLearningPlan(LearningPlan learningPlan, String userEmail) {
        learningPlan.setUserEmail(userEmail);
        learningPlan.setPublic(learningPlan.isPublic());
        return learningPlanRepository.save(learningPlan);
    }

    public List<LearningPlan> getUserLearningPlans(String userEmail) {
        try {
            return learningPlanRepository.findByUserEmail(userEmail);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user learning plans: " + e.getMessage(), e);
        }
    }

    public List<LearningPlan> getPublicLearningPlans() {
        try {
            return learningPlanRepository.findByIsPublicTrue();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch public learning plans: " + e.getMessage(), e);
        }
    }

    public Optional<LearningPlan> getLearningPlanById(String id) {
        try {
            return learningPlanRepository.findById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch learning plan by ID: " + e.getMessage(), e);
        }
    }

    public LearningPlan updateLearningPlan(String id, LearningPlan learningPlan, String userEmail) {
        Optional<LearningPlan> existingPlan = getLearningPlanById(id);
        if (existingPlan.isPresent() && existingPlan.get().getUserEmail().equals(userEmail)) {
            learningPlan.setId(id);
            learningPlan.setUserEmail(userEmail);
            learningPlan.setPublic(learningPlan.isPublic());
            return learningPlanRepository.save(learningPlan);
        }
        throw new RuntimeException("Learning Plan not found or unauthorized");
    }

    public void deleteLearningPlan(String id, String userEmail) {
        Optional<LearningPlan> existingPlan = getLearningPlanById(id);
        if (existingPlan.isPresent() && existingPlan.get().getUserEmail().equals(userEmail)) {
            learningPlanRepository.deleteById(id);
        } else {
            throw new RuntimeException("Learning Plan not found or unauthorized");
        }
    }

    public LearningPlan updateProgress(String id, int progress, String userEmail) {
        Optional<LearningPlan> optionalPlan = getLearningPlanById(id);
        if (optionalPlan.isPresent() && optionalPlan.get().getUserEmail().equals(userEmail)) {
            LearningPlan plan = optionalPlan.get();
            plan.setProgress(progress);
            return learningPlanRepository.save(plan);
        }
        throw new RuntimeException("Learning Plan not found or unauthorized");
    }
}