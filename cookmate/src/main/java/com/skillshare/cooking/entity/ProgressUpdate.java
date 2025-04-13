package com.skillshare.cooking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "progress_updates")
public class ProgressUpdate {

    @Id
    private String id;

    private String planId;

    private int progressPercentage;

    private String userEmail;

    // Constructors
    public ProgressUpdate() {}

    public ProgressUpdate(String planId, int progressPercentage, String userEmail) {
        this.planId = planId;
        this.progressPercentage = progressPercentage;
        this.userEmail = userEmail;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPlanId() {
        return planId;
    }

    public void setPlanId(String planId) {
        this.planId = planId;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    @Override
    public String toString() {
        return "ProgressUpdate{" +
                "id='" + id + '\'' +
                ", planId='" + planId + '\'' +
                ", progressPercentage=" + progressPercentage +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }
}