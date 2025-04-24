package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.Image;
import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.repository.ImageRepository;
import com.skillshare.cooking.repository.UserRepository;
import org.bson.types.Binary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;
    
    @Autowired
    private MongoTemplate mongoTemplate;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }

    public User updateUser(String email, User updatedUser) {
        User existingUser = userRepository.findByEmail(email);
        if (existingUser == null) {
            throw new RuntimeException("User not found with email: " + email);
        }

        // If a new profile picture is uploaded, delete the old one
        String newProfilePictureUrl = updatedUser.getProfilePictureUrl();
        if (newProfilePictureUrl != null && !newProfilePictureUrl.trim().isEmpty() && 
            !newProfilePictureUrl.equals(existingUser.getProfilePictureUrl())) {
            // Extract the old image ID from the existing profilePictureUrl
            String oldProfilePictureUrl = existingUser.getProfilePictureUrl();
            if (oldProfilePictureUrl != null && oldProfilePictureUrl.startsWith("http://localhost:8080/api/images/")) {
                String oldImageId = oldProfilePictureUrl.substring(oldProfilePictureUrl.lastIndexOf("/") + 1);
                try {
                    imageRepository.deleteById(oldImageId);
                    System.out.println("UserService - Deleted old profile picture with ID: " + oldImageId);
                } catch (Exception e) {
                    System.err.println("UserService - Error deleting old profile picture: " + e.getMessage());
                }
            }
        }

        existingUser.setName(updatedUser.getName());
        // Only update profilePictureUrl if the new value is not null and not empty
        if (newProfilePictureUrl != null && !newProfilePictureUrl.trim().isEmpty()) {
            existingUser.setProfilePictureUrl(newProfilePictureUrl);
        }
        existingUser.setBio(updatedUser.getBio());
        existingUser.setLocation(updatedUser.getLocation());
        existingUser.setFavoriteCuisines(updatedUser.getFavoriteCuisines());
        return userRepository.save(existingUser);
    }

    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }
        // Delete the user's profile picture
        String profilePictureUrl = user.getProfilePictureUrl();
        if (profilePictureUrl != null && profilePictureUrl.startsWith("http://localhost:8080/api/images/")) {
            String imageId = profilePictureUrl.substring(profilePictureUrl.lastIndexOf("/") + 1);
            try {
                imageRepository.deleteById(imageId);
                System.out.println("UserService - Deleted profile picture with ID: " + imageId);
            } catch (Exception e) {
                System.err.println("UserService - Error deleting profile picture: " + e.getMessage());
            }
        }
        userRepository.delete(user);
    }

    public String uploadProfilePicture(String email, MultipartFile file) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }

        // Save new profile picture
        Image image = new Image(
            file.getOriginalFilename(),
            file.getContentType(),
            new Binary(file.getBytes())
        );
        Image savedImage = imageRepository.save(image);

        // Update user's profile picture URL
        String newProfilePictureUrl = "http://localhost:8080/api/images/" + savedImage.getId();
        user.setProfilePictureUrl(newProfilePictureUrl);
        userRepository.save(user);

        return savedImage.getId();
    }
    
    /**
     * Find all users in the system
     * @return List of all users
     */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Search users by name
     * @param searchTerm The name or part of the name to search for
     * @return List of users whose names contain the search term
     */
    public List<User> searchUsersByName(String searchTerm) {
        Query query = new Query();
        query.addCriteria(Criteria.where("name").regex(searchTerm, "i")); // "i" for case-insensitive
        return mongoTemplate.find(query, User.class);
    }
    
    /**
     * Follow a user
     * @param currentUserEmail Email of the current user
     * @param targetUserId ID of the user to follow
     * @return Updated user object of the current user
     */
    public User followUser(String currentUserEmail, String targetUserId) {
        User currentUser = userRepository.findByEmail(currentUserEmail);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }
        
        Optional<User> targetUserOpt = userRepository.findById(targetUserId);
        if (targetUserOpt.isEmpty()) {
            throw new RuntimeException("Target user not found");
        }
        User targetUser = targetUserOpt.get();
        
        // Don't allow following yourself
        if (currentUser.getId().equals(targetUserId)) {
            throw new RuntimeException("You cannot follow yourself");
        }
        
        // Check if already following
        if (currentUser.getFollowing().contains(targetUserId)) {
            return currentUser; // Already following, no change needed
        }
        
        // Update following list for current user
        currentUser.getFollowing().add(targetUserId);
        userRepository.save(currentUser);
        
        // Update followers list for target user
        targetUser.getFollowers().add(currentUser.getId());
        userRepository.save(targetUser);
        
        return currentUser;
    }
    
    /**
     * Unfollow a user
     * @param currentUserEmail Email of the current user
     * @param targetUserId ID of the user to unfollow
     * @return Updated user object of the current user
     */
    public User unfollowUser(String currentUserEmail, String targetUserId) {
        User currentUser = userRepository.findByEmail(currentUserEmail);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }
        
        Optional<User> targetUserOpt = userRepository.findById(targetUserId);
        if (targetUserOpt.isEmpty()) {
            throw new RuntimeException("Target user not found");
        }
        User targetUser = targetUserOpt.get();
        
        // Check if actually following
        if (!currentUser.getFollowing().contains(targetUserId)) {
            return currentUser; // Not following, no change needed
        }
        
        // Update following list for current user
        currentUser.getFollowing().remove(targetUserId);
        userRepository.save(currentUser);
        
        // Update followers list for target user
        targetUser.getFollowers().remove(currentUser.getId());
        userRepository.save(targetUser);
        
        return currentUser;
    }
    
    /**
     * Get a simplified user profile for public viewing
     * @param userId ID of the user to get profile for
     * @param currentUserEmail Email of the current user viewing the profile
     * @return User object with following status
     */
    public User getUserProfile(String userId, String currentUserEmail) {
        Optional<User> targetUserOpt = userRepository.findById(userId);
        if (targetUserOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User targetUser = targetUserOpt.get();
        
        // If this is the current user's own profile, just return it
        User currentUser = userRepository.findByEmail(currentUserEmail);
        if (currentUser != null && currentUser.getId().equals(userId)) {
            return currentUser;
        }
        
        // Otherwise return the target user
        return targetUser;
    }
    
    /**
     * Check if a user is following another user
     * @param currentUserEmail Email of the current user
     * @param targetUserId ID of the target user
     * @return true if following, false otherwise
     */
    public boolean isFollowing(String currentUserEmail, String targetUserId) {
        User currentUser = userRepository.findByEmail(currentUserEmail);
        if (currentUser == null) {
            return false;
        }
        
        return currentUser.getFollowing().contains(targetUserId);
    }
}