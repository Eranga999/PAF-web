package com.skillshare.cooking.repository;

import com.skillshare.cooking.entity.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    List<LearningPlan> findByUserEmail(String userEmail);
    List<LearningPlan> findByIsPublicTrue();
}
