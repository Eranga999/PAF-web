package com.skillshare.cooking.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "progress_updates")
@Data
public class ProgressUpdate {
    @Id
    private String id;
    private String title;
    private String description;
    private String planId; // Reference to the associated LearningPlan
    private int progressPercentage;
}