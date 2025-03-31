package com.skillshare.cooking.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "learning_plans")
@Data
public class LearningPlan {
    @Id
    private String id;
    private String title;
    private String description;
    private List<Topic> topics;
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private int progress;
    private int total;

    @Data
    public static class Topic {
        private String title;
        private boolean completed;
    }
}