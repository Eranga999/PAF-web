package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.Comment;
import com.skillshare.cooking.entity.Post;
import com.skillshare.cooking.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

    public Post updatePost(String id, Post post) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        existingPost.setTitle(post.getTitle());
        existingPost.setDescription(post.getDescription());
        existingPost.setIngredients(post.getIngredients());
        existingPost.setInstructions(post.getInstructions());
        existingPost.setMediaUrls(post.getMediaUrls());
        existingPost.setTags(post.getTags());
        existingPost.setCreatedDate(post.getCreatedDate());
        existingPost.setUserEmail(post.getUserEmail());
        existingPost.setLikes(post.getLikes()); // Update likes
        existingPost.setComments(post.getComments()); // Update comments
        return postRepository.save(existingPost);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    public List<Post> getPostsByUserEmail(String userEmail) {
        return postRepository.findByUserEmail(userEmail);
    }

    public Post likePost(String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setLikes(post.getLikes() + 1);
        return postRepository.save(post);
    }

    public Post addComment(String id, Comment comment) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.getComments().add(comment);
        return postRepository.save(post);
    }
}