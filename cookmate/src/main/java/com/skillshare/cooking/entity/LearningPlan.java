package com.skillshare.cooking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@Document(collection = "learning_plans")
public class LearningPlan {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private Integer progress;

    private List<Topic> topics;

    private String startDate;

    private String estimatedEndDate;

    private String userEmail;

    private boolean isPublic; // New field

    // Nested Topic class
    public static class Topic {
        @NotBlank(message = "Topic title is required")
        private String title;

        private String description;

        private boolean completed;

        public Topic() {}

        public Topic(String title, String description, boolean completed) {
            this.title = title;
            this.description = description;
            this.completed = completed;
        }

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public LearningPlan() {}

    public LearningPlan(String title, String description, Integer progress, List<Topic> topics, String startDate, String estimatedEndDate, String userEmail, boolean isPublic) {
        this.title = title;
        this.description = description;
        this.progress = progress;
        this.topics = topics;
        this.startDate = startDate;
        this.estimatedEndDate = estimatedEndDate;
        this.userEmail = userEmail;
        this.isPublic = isPublic;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public List<Topic> getTopics() { return topics; }
    public void setTopics(List<Topic> topics) { this.topics = topics; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEstimatedEndDate() { return estimatedEndDate; }
    public void setEstimatedEndDate(String estimatedEndDate) { this.estimatedEndDate = estimatedEndDate; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    @Override
    public String toString() {
        return "LearningPlan{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", progress=" + progress +
                ", topics=" + topics +
                ", startDate='" + startDate + '\'' +
                ", estimatedEndDate='" + estimatedEndDate + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", isPublic=" + isPublic +
                '}';
    }
}
