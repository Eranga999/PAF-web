package com.cookmate.service;

import com.cookmate.entity.Post;
import com.cookmate.entity.User;
import com.cookmate.repository.PostRepository;
import com.cookmate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public Post createPost(Long userId, Post post, List<String> mediaUrls, List<String> tags) {
        System.out.println("Creating post for userId: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("Found user: " + user.getUsername());

        // Validate media: up to 3 photos or 1 video
        if (mediaUrls != null) {
            System.out.println("Media URLs received: " + mediaUrls);
            if (mediaUrls.size() > 3) {
                throw new RuntimeException("Cannot upload more than 3 photos or 1 video");
            }
            post.setMediaUrls(mediaUrls);
        }

        System.out.println("Tags received: " + tags);
        post.setUser(user);
        post.setTags(tags);
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post updatePost(Long postId, Post updatedPost, List<String> mediaUrls, List<String> tags) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(updatedPost.getTitle());
        post.setDescription(updatedPost.getDescription());
        post.setIngredients(updatedPost.getIngredients());
        post.setInstructions(updatedPost.getInstructions());

        if (mediaUrls != null) {
            if (mediaUrls.size() > 3) {
                throw new RuntimeException("Cannot upload more than 3 photos or 1 video");
            }
            post.setMediaUrls(mediaUrls);
        }

        post.setTags(tags);
        return postRepository.save(post);
    }

    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        postRepository.delete(post);
    }

    public List<Post> getPostsByUserId(Long userId) {
        return postRepository.findByUserId(userId);
    }
}