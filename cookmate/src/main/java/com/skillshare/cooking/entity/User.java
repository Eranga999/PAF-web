package com.skillshare.cooking.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String googleId;

    @Indexed(unique = true)
    private String email;

    private String name;

    private String profilePictureUrl;

    private String bio;

    private String location;

    private List<String> favoriteCuisines;

    private LocalDateTime createdAt;
    
    // List of user IDs who are following this user
    private List<String> followers = new ArrayList<>();
    
    // List of user IDs that this user is following
    private List<String> following = new ArrayList<>();

    public User() {
        this.createdAt = LocalDateTime.now();
        this.followers = new ArrayList<>();
        this.following = new ArrayList<>();
    }
    
    // Helper methods for follower/following counts
    public int getFollowersCount() {
        return followers != null ? followers.size() : 0;
    }
    
    public int getFollowingCount() {
        return following != null ? following.size() : 0;
    }
}