package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.Post;
import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.service.PostService;
import com.skillshare.cooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
            User user = userService.updateUser(email, updatedUser);
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
}