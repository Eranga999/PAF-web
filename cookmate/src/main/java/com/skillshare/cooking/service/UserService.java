package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.Image;
import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.repository.ImageRepository;
import com.skillshare.cooking.repository.UserRepository;
import org.bson.types.Binary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;

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
}