package com.skillshare.cooking.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "learning_plans")
@Data
public class LearningPlan {

  @Id
  private String id;

  @NotBlank(message = "Title is mandatory")
  @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
  private String title;

  @NotBlank(message = "Description is mandatory")
  @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
  private String description;

  private int progress = 0;

  private List<Topic> topics = new ArrayList<>();

  private Date startDate;

  private Date estimatedEndDate;

  private String userEmail;

  @JsonProperty("isPublic")
  private boolean isPublic;

  @Data
  public static class Topic {
    @NotBlank(message = "Topic title is mandatory")
    private String title;

    private String description;

    private boolean completed = false;
  }
}