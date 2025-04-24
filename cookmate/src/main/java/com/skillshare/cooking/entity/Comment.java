package com.skillshare.cooking.entity;

public class Comment {

    private String userEmail; // Email of the commenter
    private String content;   // Comment text
    private String createdDate; // When the comment was made

    public Comment() {}

    public Comment(String userEmail, String content, String createdDate) {
        this.userEmail = userEmail;
        this.content = content;
        this.createdDate = createdDate;
    }

    // Getters and Setters
    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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

    @Override
    public String toString() {
        return "Comment{" +
                "userEmail='" + userEmail + '\'' +
                ", content='" + content + '\'' +
                ", createdDate='" + createdDate + '\'' +
                '}';
    }
}