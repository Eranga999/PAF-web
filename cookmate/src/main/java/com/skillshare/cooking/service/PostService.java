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
        existingPost.setLikedBy(post.getLikedBy());
        existingPost.setComments(post.getComments());
        return postRepository.save(existingPost);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    public List<Post> getPostsByUserEmail(String userEmail) {
        return postRepository.findByUserEmail(userEmail);
    }

    public Post likePost(String id, String userEmail) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        List<String> likedBy = post.getLikedBy();
        if (likedBy.contains(userEmail)) {
            // User already liked, so unlike by removing their email
            likedBy.remove(userEmail);
        } else {
            // User hasn't liked, so add their email
            likedBy.add(userEmail);
        }
        post.setLikedBy(likedBy);
        return postRepository.save(post);
    }

    public Post addComment(String id, Comment comment) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.getComments().add(comment);
        return postRepository.save(post);
    }

    public Post editComment(String postId, int commentIndex, Comment updatedComment, String userEmail) throws IllegalAccessException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        List<Comment> comments = post.getComments();
        if (commentIndex < 0 || commentIndex >= comments.size()) {
            throw new RuntimeException("Comment not found at index: " + commentIndex);
        }
        Comment existingComment = comments.get(commentIndex);
        if (!existingComment.getUserEmail().equals(userEmail)) {
            throw new IllegalAccessException("User is not authorized to edit this comment");
        }
        updatedComment.setUserEmail(userEmail);
        updatedComment.setCreatedDate(existingComment.getCreatedDate()); // Preserve original date
        comments.set(commentIndex, updatedComment);
        post.setComments(comments);
        return postRepository.save(post);
    }

    public Post deleteComment(String postId, int commentIndex, String userEmail) throws IllegalAccessException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        List<Comment> comments = post.getComments();
        if (commentIndex < 0 || commentIndex >= comments.size()) {
            throw new RuntimeException("Comment not found at index: " + commentIndex);
        }
        Comment comment = comments.get(commentIndex);
        if (!comment.getUserEmail().equals(userEmail) && !post.getUserEmail().equals(userEmail)) {
            throw new IllegalAccessException("User is not authorized to delete this comment");
        }
        comments.remove(commentIndex);
        post.setComments(comments);
        return postRepository.save(post);
    }
}