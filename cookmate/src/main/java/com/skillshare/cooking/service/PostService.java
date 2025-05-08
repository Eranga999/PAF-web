package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.Comment;
import com.skillshare.cooking.entity.Notification;
import com.skillshare.cooking.entity.Post;
import com.skillshare.cooking.repository.NotificationRepository;
import com.skillshare.cooking.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Post likePost(String postId, String email) {
        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isEmpty()) {
            throw new RuntimeException("Post not found with id: " + postId);
        }
        Post post = postOptional.get();
        List<String> likedBy = post.getLikedBy();
        if (!likedBy.contains(email)) {
            likedBy.add(email);
            post.setLikedBy(likedBy);
            postRepository.save(post);

            // Create notification for post owner (if not liking own post)
            if (!post.getUserEmail().equals(email)) {
                Notification notification = new Notification(
                        post.getUserEmail(),
                        "LIKE",
                        postId,
                        email,
                        email + " liked your post: " + post.getTitle(),
                        new Date().toString()
                );
                notificationRepository.save(notification);
            }
        } else {
            likedBy.remove(email);
            post.setLikedBy(likedBy);
            postRepository.save(post);
        }
        return post;
    }

    public Post addComment(String postId, Comment comment) {
        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isEmpty()) {
            throw new RuntimeException("Post not found with id: " + postId);
        }
        Post post = postOptional.get();
        List<Comment> comments = post.getComments();
        comments.add(comment);
        post.setComments(comments);
        postRepository.save(post);

        // Create notification for post owner (if not commenting on own post)
        if (!post.getUserEmail().equals(comment.getUserEmail())) {
            Notification notification = new Notification(
                    post.getUserEmail(),
                    "COMMENT",
                    postId,
                    comment.getUserEmail(),
                    comment.getUserEmail() + " commented on your post: " + post.getTitle(),
                    new Date().toString()
            );
            notificationRepository.save(notification);
        }
        return post;
    }

    // Other existing methods should remain unchanged
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
        Optional<Post> postOptional = postRepository.findById(id);
        if (postOptional.isEmpty()) {
            throw new RuntimeException("Post not found with id: " + id);
        }
        Post existingPost = postOptional.get();
        existingPost.setTitle(post.getTitle());
        existingPost.setDescription(post.getDescription());
        existingPost.setIngredients(post.getIngredients());
        existingPost.setInstructions(post.getInstructions());
        existingPost.setMediaUrls(post.getMediaUrls());
        existingPost.setTags(post.getTags());
        return postRepository.save(existingPost);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    public List<Post> getPostsByUserEmail(String userEmail) {
        return postRepository.findByUserEmail(userEmail);
    }

    public Post editComment(String postId, int commentIndex, Comment updatedComment, String userEmail) throws IllegalAccessException {
        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isEmpty()) {
            throw new RuntimeException("Post not found with id: " + postId);
        }
        Post post = postOptional.get();
        List<Comment> comments = post.getComments();
        if (commentIndex < 0 || commentIndex >= comments.size()) {
            throw new RuntimeException("Invalid comment index");
        }
        Comment existingComment = comments.get(commentIndex);
        if (!existingComment.getUserEmail().equals(userEmail)) {
            throw new IllegalAccessException("You can only edit your own comments");
        }
        existingComment.setContent(updatedComment.getContent());
        existingComment.setCreatedDate(new Date().toString());
        post.setComments(comments);
        return postRepository.save(post);
    }

    public Post deleteComment(String postId, int commentIndex, String userEmail) throws IllegalAccessException {
        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isEmpty()) {
            throw new RuntimeException("Post not found with id: " + postId);
        }
        Post post = postOptional.get();
        List<Comment> comments = post.getComments();
        if (commentIndex < 0 || commentIndex >= comments.size()) {
            throw new RuntimeException("Invalid comment index");
        }
        Comment comment = comments.get(commentIndex);
        if (!comment.getUserEmail().equals(userEmail)) {
            throw new IllegalAccessException("You can only delete your own comments");
        }
        comments.remove(commentIndex);
        post.setComments(comments);
        return postRepository.save(post);
    }
}