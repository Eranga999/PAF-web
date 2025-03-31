package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.ProgressUpdate;
import com.skillshare.cooking.repository.ProgressUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public void deleteProgressUpdate(String id) {
        // Find the progress update to get its planId before deleting
        Optional<ProgressUpdate> progressUpdateOpt = progressUpdateRepository.findById(id);
        if (progressUpdateOpt.isPresent()) {
            ProgressUpdate progressUpdate = progressUpdateOpt.get();
            String planId = progressUpdate.getPlanId();

            // Delete the progress update
            progressUpdateRepository.deleteById(id);

            // Update the corresponding LearningPlan's progress if it exists
            if (planId != null) {
                // Fetch remaining progress updates for the plan
                List<ProgressUpdate> remainingUpdates = progressUpdateRepository.findByPlanId(planId);
                double averageProgress = remainingUpdates.stream()
                        .mapToDouble(ProgressUpdate::getProgressPercentage)
                        .average()
                        .orElse(0);
                learningPlanService.updateProgress(planId, (int) averageProgress);
            }
        } else {
            throw new RuntimeException("Progress update not found with id: " + id);
        }
    }
}