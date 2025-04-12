package com.skillshare.cooking.repository;

import com.skillshare.cooking.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByGoogleId(String googleId);
    User findByEmail(String email);
}