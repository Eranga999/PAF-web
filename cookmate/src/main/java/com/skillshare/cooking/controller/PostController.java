package com.cookmate.controller;

import com.cookmate.entity.Post;
import com.cookmate.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("/create/{userId}")
    public Post createPost(@PathVariable Long userId, @Valid @RequestBody Post post,
                           @RequestParam(required = false) List<String> mediaUrls,
                           @RequestParam(required = false) List<String> tags) {
        System.out.println("Received createPost request for userId: " + userId);
        System.out.println("Post data: " + post);
        System.out.println("Media URLs: " + mediaUrls);
        System.out.println("Tags: " + tags);
        return postService.createPost(userId, post, mediaUrls, tags);
    }

    @PutMapping("/update/{postId}")
    public Post updatePost(@PathVariable Long postId, @Valid @RequestBody Post post,
                           @RequestParam(required = false) List<String> mediaUrls,
                           @RequestParam(required = false) List<String> tags) {
        return postService.updatePost(postId, post, mediaUrls, tags);
    }

    @DeleteMapping("/delete/{postId}")
    public String deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return "Post deleted successfully";
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUserId(@PathVariable Long userId) {
        return postService.getPostsByUserId(userId);
    }
}