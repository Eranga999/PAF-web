package com.skillshare.cooking.service;

import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
        existingUser.setName(updatedUser.getName());
        existingUser.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
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
        userRepository.delete(user);
    }
}