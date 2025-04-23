package com.skillshare.cooking.repository;

import com.skillshare.cooking.entity.Image;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ImageRepository extends MongoRepository<Image, String> {
}