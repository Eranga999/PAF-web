

package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.ProgressUpdate;
import com.skillshare.cooking.repository.ProgressUpdateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressUpdateService {

    private static final Logger logger = LoggerFactory.getLogger(ProgressUpdateService.class);

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    public ProgressUpdate createProgressUpdate(ProgressUpdate progressUpdate, String userEmail) {
        logger.info("Creating progress update for user: {} with planId: {}", userEmail, progressUpdate.getPlanId());
        progressUpdate.setUserEmail(userEmail);
        progressUpdate.setCreatedAt(new Date()); // Ensure createdAt is set
        ProgressUpdate savedUpdate = progressUpdateRepository.save(progressUpdate);
        logger.info("Successfully created progress update with id: {} for user: {}", savedUpdate.getId(), userEmail);
        return savedUpdate;
    }

    public List<ProgressUpdate> getProgressUpdatesByPlanId(String planId, String userEmail) {
        try {
            logger.info("Fetching progress updates for planId: {} by user: {}", planId, userEmail);
            List<ProgressUpdate> updates = progressUpdateRepository.findByPlanIdAndUserEmail(planId, userEmail);
            logger.info("Found {} progress updates for planId: {} by user: {}", updates.size(), planId, userEmail);
            return updates;
        } catch (Exception e) {
            logger.error("Failed to fetch progress updates for planId: {} by user: {}, error: {}", planId, userEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch progress updates: " + e.getMessage(), e);
        }
    }

    public List<ProgressUpdate> getAllProgressUpdatesForUser(String userEmail) {
        try {
            logger.info("Fetching all progress updates for user: {}", userEmail);
            List<ProgressUpdate> updates = progressUpdateRepository.findByUserEmail(userEmail);
            logger.info("Found {} progress updates for user: {}", updates.size(), userEmail);
            return updates;
        } catch (Exception e) {
            logger.error("Failed to fetch all progress updates for user: {}, error: {}", userEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch all progress updates: " + e.getMessage(), e);
        }
    }

    public void deleteProgressUpdate(String id, String userEmail) {
        logger.info("Deleting progress update with id: {} for user: {}", id, userEmail);
        Optional<ProgressUpdate> existingUpdate = progressUpdateRepository.findById(id);
        if (existingUpdate.isPresent() && existingUpdate.get().getUserEmail().equals(userEmail)) {
            progressUpdateRepository.deleteById(id);
            logger.info("Successfully deleted progress update with id: {} for user: {}", id, userEmail);
        } else {
            logger.warn("Progress update not found or unauthorized for user: {} with id: {}", userEmail, id);
            throw new RuntimeException("Progress update not found or unauthorized");
        }
    }
}