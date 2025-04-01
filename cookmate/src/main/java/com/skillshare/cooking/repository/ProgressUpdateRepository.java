package com.skillshare.cooking.repository;

import com.skillshare.cooking.entity.ProgressUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProgressUpdateRepository extends MongoRepository<ProgressUpdate, String> {
    List<ProgressUpdate> findByPlanId(String planId);
}