package com.skillshare.cooking.repository;

import com.skillshare.cooking.entity.Media;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MediaRepository extends MongoRepository<Media, String> {
}