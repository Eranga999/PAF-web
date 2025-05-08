package com.skillshare.cooking.repository;

import com.skillshare.cooking.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserEmailOrderByCreatedDateDesc(String userEmail);
}