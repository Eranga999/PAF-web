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

    public ProgressUpdate createProgressUpdate(ProgressUpdate progressUpdate, String userEmail) {
        // Save the progress update
        ProgressUpdate savedUpdate = progressUpdateRepository.save(progressUpdate);

        // Update the corresponding LearningPlan's progress
        if (progressUpdate.getPlanId() != null) {
            learningPlanService.updateProgress(progressUpdate.getPlanId(), progressUpdate.getProgressPercentage(), userEmail);
        }

        return savedUpdate;
    }

    public List<ProgressUpdate> getProgressUpdatesByPlanId(String planId, String userEmail) {
        List<ProgressUpdate> updates = progressUpdateRepository.findByPlanId(planId);
        // Filter by userEmail to ensure users only see their own updates
        return updates.stream()
                .filter(update -> userEmail.equals(update.getUserEmail()))
                .toList();
    }

    public List<ProgressUpdate> getAllProgressUpdates(String userEmail) {
        List<ProgressUpdate> updates = progressUpdateRepository.findAll();
        // Filter by userEmail
        return updates.stream()
                .filter(update -> userEmail.equals(update.getUserEmail()))
                .toList();
    }

    public void deleteProgressUpdate(String id, String userEmail) {
        // Find the progress update to get its planId before deleting
        Optional<ProgressUpdate> progressUpdateOpt = progressUpdateRepository.findById(id);
        if (progressUpdateOpt.isPresent()) {
            ProgressUpdate progressUpdate = progressUpdateOpt.get();
            if (!userEmail.equals(progressUpdate.getUserEmail())) {
                throw new RuntimeException("Unauthorized: You can only delete your own progress updates");
            }
            String planId = progressUpdate.getPlanId();

            // Delete the progress update
            progressUpdateRepository.deleteById(id);

            // Update the corresponding LearningPlan's progress if it exists
            if (planId != null) {
                // Fetch remaining progress updates for the plan
                List<ProgressUpdate> remainingUpdates = progressUpdateRepository.findByPlanId(planId)
                        .stream()
                        .filter(update -> userEmail.equals(update.getUserEmail()))
                        .toList();
                double averageProgress = remainingUpdates.stream()
                        .mapToDouble(ProgressUpdate::getProgressPercentage)
                        .average()
                        .orElse(0);
                learningPlanService.updateProgress(planId, (int) averageProgress, userEmail);
            }
        } else {
            throw new RuntimeException("Progress update not found with id: " + id);
        }
    }
}