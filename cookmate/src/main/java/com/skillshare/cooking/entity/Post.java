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

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String ingredients;

    private String instructions;

    private List<MediaUrl> mediaUrls;

    private List<String> tags;

    private String userId;

    private String createdAt;

    // Nested MediaUrl class
    public static class MediaUrl {
        @NotBlank(message = "Media URL is required")
        private String url;

        private String type;

        private boolean isPrimary;

        public MediaUrl() {}

        public MediaUrl(String url, String type, boolean isPrimary) {
            this.url = url;
            this.type = type;
            this.isPrimary = isPrimary;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public boolean isPrimary() {
            return isPrimary;
        }

        public void setPrimary(boolean isPrimary) {
            this.isPrimary = isPrimary;
        }
    }

    // Constructors
    public Post() {}

    public Post(String title, String description, String ingredients, String instructions, 
                List<MediaUrl> mediaUrls, List<String> tags, String userId, String createdAt) {
        this.title = title;
        this.description = description;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.mediaUrls = mediaUrls;
        this.tags = tags;
        this.userId = userId;
        this.createdAt = createdAt;
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

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public List<MediaUrl> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<MediaUrl> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Post{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", ingredients='" + ingredients + '\'' +
                ", instructions='" + instructions + '\'' +
                ", mediaUrls=" + mediaUrls +
                ", tags=" + tags +
                ", userId='" + userId + '\'' +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}