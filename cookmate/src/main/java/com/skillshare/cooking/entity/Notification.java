package com.skillshare.cooking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userEmail; // User receiving the notification
    private String type; // "LIKE" or "COMMENT"
    private String postId; // ID of the post involved
    private String triggerUserEmail; // User who triggered the notification
    private String content; // Notification message
    private String createdDate; // When the notification was created
    private boolean read; // Whether the notification has been read

    public Notification() {
    }

    public Notification(String userEmail, String type, String postId, String triggerUserEmail, String content, String createdDate) {
        this.userEmail = userEmail;
        this.type = type;
        this.postId = postId;
        this.triggerUserEmail = triggerUserEmail;
        this.content = content;
        this.createdDate = createdDate;
        this.read = false;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getTriggerUserEmail() {
        return triggerUserEmail;
    }

    public void setTriggerUserEmail(String triggerUserEmail) {
        this.triggerUserEmail = triggerUserEmail;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    @Override
    public String toString() {
        return "Notification{" +
                "id='" + id + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", type='" + type + '\'' +
                ", postId='" + postId + '\'' +
                ", triggerUserEmail='" + triggerUserEmail + '\'' +
                ", content='" + content + '\'' +
                ", createdDate='" + createdDate + '\'' +
                ", read=" + read +
                '}';
    }
}