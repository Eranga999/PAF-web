package com.skillshare.cooking.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
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

    public User() {
        this.createdAt = LocalDateTime.now();
    }
}