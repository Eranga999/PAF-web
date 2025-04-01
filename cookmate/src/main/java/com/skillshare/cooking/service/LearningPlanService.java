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

    public LearningPlan createLearningPlan(LearningPlan learningPlan) {
        return learningPlanRepository.save(learningPlan);
    }

    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanRepository.findAll();
    }

    public Optional<LearningPlan> getLearningPlanById(String id) {
        return learningPlanRepository.findById(id);
    }

    public Optional<LearningPlan> getLearningPlanByTitle(String title) {
        return learningPlanRepository.findByTitle(title);
    }

    public LearningPlan updateLearningPlan(String id, LearningPlan learningPlan) {
        learningPlan.setId(id);
        return learningPlanRepository.save(learningPlan);
    }

    public void deleteLearningPlan(String id) {
        learningPlanRepository.deleteById(id);
    }

    public LearningPlan updateProgress(String id, int progress) {
        Optional<LearningPlan> optionalPlan = learningPlanRepository.findById(id);
        if (optionalPlan.isPresent()) {
            LearningPlan plan = optionalPlan.get();
            plan.setProgress(progress);
            return learningPlanRepository.save(plan);
        }
        throw new RuntimeException("Learning Plan not found with id: " + id);
    }
}