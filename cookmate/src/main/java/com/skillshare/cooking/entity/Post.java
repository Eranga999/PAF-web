package com.skillshare.cooking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@Document(collection = "posts")
public class Post {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private List<String> ingredients;

    private List<String> instructions;

    private List<String> mediaUrls; // URLs for up to 3 photos or a 30-second video

    private List<String> tags; // e.g., #Italian, #Baking

    private String createdDate; // ISO 8601 string (e.g., "2025-04-07T00:00:00.000Z")

    private String userEmail; // Reference to the user who created the post by email

    // Constructors
    public Post() {}

    public Post(String title, String description, List<String> ingredients, List<String> instructions,
                List<String> mediaUrls, List<String> tags, String createdDate, String userEmail) {
        this.title = title;
        this.description = description;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.mediaUrls = mediaUrls;
        this.tags = tags;
        this.createdDate = createdDate;
        this.userEmail = userEmail;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getInstructions() {
        return instructions;
    }

    public void setInstructions(List<String> instructions) {
        this.instructions = instructions;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    @Override
    public String toString() {
        return "Post{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", ingredients=" + ingredients +
                ", instructions=" + instructions +
                ", mediaUrls=" + mediaUrls +
                ", tags=" + tags +
                ", createdDate='" + createdDate + '\'' +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }
}