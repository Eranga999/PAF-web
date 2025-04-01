package com.skillshare.cooking.service;

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

    public List<Post> getPostByUserId(String userId) {
        return postRepository.findByUserId(userId);
    }

    public Post updatePost(String id, Post post) {
        post.setId(id);
        return postRepository.save(post);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    public Post updateMediaUrls(String id, List<Post.MediaUrl> mediaUrls) {
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            post.setMediaUrls(mediaUrls);
            return postRepository.save(post);
        }
        throw new RuntimeException("Post not found with id: " + id);
    }
}