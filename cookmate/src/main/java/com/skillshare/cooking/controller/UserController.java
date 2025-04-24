package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.Post;
import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.service.PostService;
import com.skillshare.cooking.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Fetching profile for user email: {}", email);
            User user = userService.getUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error fetching profile: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedUser) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Updating profile for user email: {}", email);
            User user = userService.updateUser(email, updatedUser);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteProfile() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Deleting profile for user email: {}", email);
            List<Post> userPosts = postService.getPostsByUserEmail(email);
            userPosts.forEach(post -> postService.deletePost(post.getId()));
            userService.deleteUser(email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting profile: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/profile/posts")
    public ResponseEntity<List<Post>> getUserPosts() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Fetching posts for user email: {}", email);
            List<Post> userPosts = postService.getPostsByUserEmail(email);
            return ResponseEntity.ok(userPosts);
        } catch (Exception e) {
            logger.error("Error fetching user posts: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                logger.error("No authenticated user found for profile picture upload");
                return ResponseEntity.status(401).body("Unauthorized");
            }

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded");
            }

            String imageId = userService.uploadProfilePicture(email, file);
            logger.info("Uploaded profile picture with ID: {} for user: {}", imageId, email);
            return ResponseEntity.ok("http://localhost:8080/api/images/" + imageId);
        } catch (Exception e) {
            logger.error("Error uploading profile picture: {}", e.getMessage());
            return ResponseEntity.status(500).body("Failed to upload profile picture: " + e.getMessage());
        }
    }
    
    /**
     * Get all users for exploration
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            logger.info("Fetching all users for exploration");
            List<User> users = userService.findAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching all users: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }
    
    /**
     * Search users by name
     */
    @GetMapping("/users/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        try {
            logger.info("Searching users with query: {}", query);
            List<User> users = userService.searchUsersByName(query);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error searching users: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }
    
    /**
     * Get a user's public profile
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("Fetching user profile for userId: {} by user: {}", userId, currentUserEmail);
            
            User user = userService.getUserProfile(userId, currentUserEmail);
            boolean isFollowing = userService.isFollowing(currentUserEmail, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("isFollowing", isFollowing);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching user profile: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }
    
    /**
     * Follow a user
     */
    @PostMapping("/users/{userId}/follow")
    public ResponseEntity<?> followUser(@PathVariable String userId) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("User {} is following user {}", currentUserEmail, userId);
            
            User updatedUser = userService.followUser(currentUserEmail, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error following user: {}", e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    
    /**
     * Unfollow a user
     */
    @PostMapping("/users/{userId}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable String userId) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            logger.info("User {} is unfollowing user {}", currentUserEmail, userId);
            
            User updatedUser = userService.unfollowUser(currentUserEmail, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error unfollowing user: {}", e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}