package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.Comment;
import com.skillshare.cooking.entity.Image;
import com.skillshare.cooking.entity.Notification;
import com.skillshare.cooking.entity.Post;
import com.skillshare.cooking.repository.ImageRepository;
import com.skillshare.cooking.repository.NotificationRepository;
import com.skillshare.cooking.service.PostService;
import org.bson.types.Binary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", exposedHeaders = "Content-Type,Content-Disposition")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private final String jwtSecret;

    public PostController(PostService postService, ImageRepository imageRepository, NotificationRepository notificationRepository, @Value("${jwt.secret}") String jwtSecret) {
        this.postService = postService;
        this.imageRepository = imageRepository;
        this.notificationRepository = notificationRepository;
        this.jwtSecret = jwtSecret;
    }

    @PostConstruct
    public void logJwtSecretLoaded() {
        System.out.println("PostController - JWT Secret loaded successfully.");
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
        System.out.println("Fetching all posts");
        List<Post> posts = postService.getAllPosts();
        System.out.println("Returning " + posts.size() + " posts");
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
            List<String> imageIds = existingPost.getMediaUrls();
            if (imageIds != null) {
                for (String imageId : imageIds) {
                    imageRepository.deleteById(imageId);
                }
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
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null) {
            System.err.println("No authenticated user found for file upload");
            return ResponseEntity.status(401).body("Unauthorized");
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        try {
            Image image = new Image(
                file.getOriginalFilename(),
                file.getContentType(),
                new Binary(file.getBytes())
            );
            Image savedImage = imageRepository.save(image);
            System.out.println("Uploaded image with ID: " + savedImage.getId());
            return ResponseEntity.ok(savedImage.getId());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<ByteArrayResource> getImage(@PathVariable String id) {
        try {
            System.out.println("Fetching image with ID: " + id);
            Optional<Image> imageOptional = imageRepository.findById(id);
            if (imageOptional.isEmpty()) {
                System.out.println("Image not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }

            Image image = imageOptional.get();
            System.out.println("Found image - FileName: " + image.getFileName() + ", ContentType: " + image.getContentType() + ", Data length: " + (image.getData() != null ? image.getData().length() : 0));

            ByteArrayResource resource = new ByteArrayResource(image.getData().getData());
            System.out.println("Returning image data with length: " + resource.contentLength());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(image.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + image.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            System.err.println("Error fetching image with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/posts/user")
    public ResponseEntity<List<Post>> getUserPosts() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Fetching posts for user email: " + email);
            List<Post> userPosts = postService.getPostsByUserEmail(email);
            System.out.println("Returning " + userPosts.size() + " posts for user: " + email);
            return ResponseEntity.ok(userPosts);
        } catch (Exception e) {
            System.err.println("Error fetching user posts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Post> likePost(@PathVariable String id) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }
            Post updatedPost = postService.likePost(id, email);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            System.err.println("Error liking post: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/posts/{id}/comment")
    public ResponseEntity<Post> addComment(@PathVariable String id, @RequestBody Comment comment) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }
            comment.setUserEmail(email);
            comment.setCreatedDate(new java.util.Date().toString());
            Post updatedPost = postService.addComment(id, comment);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            System.err.println("Error adding comment: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/posts/{postId}/comment/{commentIndex}")
    public ResponseEntity<Post> editComment(@PathVariable String postId, @PathVariable int commentIndex, @RequestBody Comment updatedComment) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }
            Post updatedPost = postService.editComment(postId, commentIndex, updatedComment, email);
            return ResponseEntity.ok(updatedPost);
        } catch (IllegalAccessException e) {
            System.err.println("Unauthorized comment edit: " + e.getMessage());
            return ResponseEntity.status(403).body(null);
        } catch (Exception e) {
            System.err.println("Error editing comment: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/posts/{postId}/comment/{commentIndex}")
    public ResponseEntity<Post> deleteComment(@PathVariable String postId, @PathVariable int commentIndex) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }
            Post updatedPost = postService.deleteComment(postId, commentIndex, email);
            return ResponseEntity.ok(updatedPost);
        } catch (IllegalAccessException e) {
            System.err.println("Unauthorized comment deletion: " + e.getMessage());
            return ResponseEntity.status(403).body(null);
        } catch (Exception e) {
            System.err.println("Error deleting comment: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }
            List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedDateDesc(email);
            System.out.println("Returning " + notifications.size() + " notifications for user: " + email);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching notifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable String id) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null) {
                System.err.println("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }
            Optional<Notification> notificationOptional = notificationRepository.findById(id);
            if (notificationOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Notification notification = notificationOptional.get();
            if (!notification.getUserEmail().equals(email)) {
                return ResponseEntity.status(403).body(null);
            }
            notification.setRead(true);
            Notification updatedNotification = notificationRepository.save(notification);
            return ResponseEntity.ok(updatedNotification);
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}