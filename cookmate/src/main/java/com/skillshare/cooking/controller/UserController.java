package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.Post;
import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.service.PostService;
import com.skillshare.cooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Fetching profile for user email: " + email);
            User user = userService.getUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("Returning user with profilePictureUrl: " + user.getProfilePictureUrl());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error fetching profile: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedUser) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Updating profile for user email: " + email);
            System.out.println("New profilePictureUrl: " + updatedUser.getProfilePictureUrl());
            User user = userService.updateUser(email, updatedUser);
            System.out.println("Updated user with profilePictureUrl: " + user.getProfilePictureUrl());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteProfile() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Deleting profile for user email: " + email);
            // Delete user's posts first
            List<Post> userPosts = postService.getPostsByUserEmail(email);
            userPosts.forEach(post -> postService.deletePost(post.getId()));
            // Delete user
            userService.deleteUser(email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error deleting profile: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/profile/posts")
    public ResponseEntity<List<Post>> getUserPosts() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Fetching posts for user email: " + email);
            List<Post> userPosts = postService.getPostsByUserEmail(email);
            System.out.println("Returning " + userPosts.size() + " posts for user: " + email);
            return ResponseEntity.ok(userPosts);
        } catch (Exception e) {
            System.err.println("Error fetching user posts: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found for profile picture upload");
                return ResponseEntity.status(401).body("Unauthorized");
            }

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded");
            }

            String imageId = userService.uploadProfilePicture(email, file);
            System.out.println("Uploaded profile picture with ID: " + imageId + " for user: " + email);
            return ResponseEntity.ok("http://localhost:8080/api/images/" + imageId);
        } catch (Exception e) {
            System.err.println("Error uploading profile picture: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to upload profile picture: " + e.getMessage());
        }
    }
}