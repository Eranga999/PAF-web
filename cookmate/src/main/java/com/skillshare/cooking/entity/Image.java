package com.skillshare.cooking.entity;

import org.bson.types.Binary;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "images")
public class Image {

    @Id
    private String id;

    private String fileName;

    private String contentType;

    private Binary data;

    // Constructors
    public Image() {}

    public Image(String fileName, String contentType, Binary data) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.data = data;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Binary getData() {
        return data;
    }

    public void setData(Binary data) {
        this.data = data;
    }
}