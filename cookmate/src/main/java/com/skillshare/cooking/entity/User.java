package com.skillshare.cooking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    private String username;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    private String profilePicture;

    private List<PostReference> posts;

    // Nested PostReference class
    public static class PostReference {
        @NotBlank(message = "Post reference is required")
        private String postId;

        private String title;

        private boolean active;

        public PostReference() {}

        public PostReference(String postId, String title, boolean active) {
            this.postId = postId;
            this.title = title;
            this.active = active;
        }

        public String getPostId() {
            return postId;
        }

        public void setPostId(String postId) {
            this.postId = postId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean active) {
            this.active = active;
        }
    }

    // Constructors
    public User() {}

    public User(String username, String bio, String profilePicture, List<PostReference> posts) {
        this.username = username;
        this.bio = bio;
        this.profilePicture = profilePicture;
        this.posts = posts;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public List<PostReference> getPosts() {
        return posts;
    }

    public void setPosts(List<PostReference> posts) {
        this.posts = posts;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", bio='" + bio + '\'' +
                ", profilePicture='" + profilePicture + '\'' +
                ", posts=" + posts +
                '}';
    }
}