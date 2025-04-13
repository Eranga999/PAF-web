package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.LearningPlan;
import com.skillshare.cooking.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return learningPlanRepository.findByUserEmail(userEmail);
    }

    public List<LearningPlan> getPublicLearningPlans() {
        return learningPlanRepository.findByIsPublicTrue();
    }

    public Optional<LearningPlan> getLearningPlanById(String id) {
        return learningPlanRepository.findById(id);
    }

    public Optional<LearningPlan> updateLearningPlan(String id, LearningPlan learningPlan, String userEmail) {
        Optional<LearningPlan> existingPlan = learningPlanRepository.findById(id);
        if (existingPlan.isPresent() && existingPlan.get().getUserEmail().equals(userEmail)) {
            learningPlan.setId(id);
            learningPlan.setUserEmail(userEmail);
            learningPlan.setPublic(learningPlan.isPublic());
            return Optional.of(learningPlanRepository.save(learningPlan));
        }
        return Optional.empty();
    }

    public boolean deleteLearningPlan(String id, String userEmail) {
        Optional<LearningPlan> existingPlan = learningPlanRepository.findById(id);
        if (existingPlan.isPresent() && existingPlan.get().getUserEmail().equals(userEmail)) {
            learningPlanRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<LearningPlan> updateProgress(String id, int progress, String userEmail) {
        Optional<LearningPlan> optionalPlan = learningPlanRepository.findById(id);
        if (optionalPlan.isPresent() && optionalPlan.get().getUserEmail().equals(userEmail)) {
            LearningPlan plan = optionalPlan.get();
            plan.setProgress(progress);
            return Optional.of(learningPlanRepository.save(plan));
        }
        return Optional.empty();
    }
}