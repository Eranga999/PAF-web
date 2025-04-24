package com.skillshare.cooking.repository;

import com.skillshare.cooking.entity.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    Optional<LearningPlan> findByTitle(String title);
}