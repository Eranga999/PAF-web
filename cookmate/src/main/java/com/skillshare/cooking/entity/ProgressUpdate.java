
package com.skillshare.cooking.entity;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "progress_updates")
@Data
public class ProgressUpdate {

    @Id
    private String id;

    @NotBlank(message = "Plan ID is mandatory")
    private String planId;

    private String title; // Made optional

    private String description; // Made optional

    @Min(value = 0, message = "Progress percentage must be at least 0")
    @Max(value = 100, message = "Progress percentage cannot exceed 100")
    private int progressPercentage;

    @NotNull(message = "Created date is mandatory")
    private Date createdAt = new Date();

    @NotBlank(message = "User email is mandatory")
    private String userEmail;
}