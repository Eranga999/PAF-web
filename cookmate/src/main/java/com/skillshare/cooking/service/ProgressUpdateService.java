package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.ProgressUpdate;
import com.skillshare.cooking.repository.ProgressUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgressUpdateService {

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private LearningPlanService learningPlanService;

    public ProgressUpdate createProgressUpdate(ProgressUpdate progressUpdate) {
        // Save the progress update
        ProgressUpdate savedUpdate = progressUpdateRepository.save(progressUpdate);

        // Update the corresponding LearningPlan's progress
        if (progressUpdate.getPlanId() != null) {
            learningPlanService.updateProgress(progressUpdate.getPlanId(), progressUpdate.getProgressPercentage());
        }

        return savedUpdate;
    }

    public List<ProgressUpdate> getProgressUpdatesByPlanId(String planId) {
        return progressUpdateRepository.findByPlanId(planId);
    }

    public List<ProgressUpdate> getAllProgressUpdates() {
        return progressUpdateRepository.findAll();
    }
}