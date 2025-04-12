package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.Post;
import com.skillshare.cooking.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    @Autowired
    private PostService postService;
    private final String jwtSecret;

    public PostController(PostService postService, @Value("${jwt.secret}") String jwtSecret) {
        this.postService = postService;
        this.jwtSecret = jwtSecret;
        System.out.println("PostController - JWT Secret: " + (jwtSecret != null ? jwtSecret : "null"));
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured in application.properties");
        }
    }

    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }
            post.setUserEmail(email);
            System.out.println("Creating post for user: " + email);
            Post createdPost = postService.createPost(post);
            return ResponseEntity.ok(createdPost);
        } catch (Exception e) {
            System.err.println("Error creating post: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        return postService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post post) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Post existingPost = postService.getPostById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
            if (!existingPost.getUserEmail().equals(email)) {
                return ResponseEntity.status(403).body(null);
            }
            Post updatedPost = postService.updatePost(id, post);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            System.err.println("Error updating post: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Post existingPost = postService.getPostById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
            if (!existingPost.getUserEmail().equals(email)) {
                return ResponseEntity.status(403).build();
            }
            postService.deletePost(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error deleting post: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        try {
            String baseDir = System.getProperty("user.dir");
            String uploadDir = baseDir + File.separator + "uploads" + File.separator;
            File directory = new File(uploadDir);

            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (!created) {
                    return ResponseEntity.status(500).body("Failed to create uploads directory at: " + uploadDir);
                }
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;

            File destFile = new File(filePath);
            file.transferTo(destFile);

            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/posts/user")
    public ResponseEntity<List<Post>> getUserPosts() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Fetching posts for user email: " + email);
            List<Post> userPosts = postService.getPostsByUserEmail(email); // Updated to use getPostsByUserEmail
            System.out.println("Returning " + userPosts.size() + " posts for user: " + email);
            return ResponseEntity.ok(userPosts);
        } catch (Exception e) {
            System.err.println("Error fetching user posts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}