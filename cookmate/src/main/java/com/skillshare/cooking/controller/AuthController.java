package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.repository.UserRepository;
import com.skillshare.cooking.service.AuthService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;
    private final AuthService authService;
    private final String jwtSecret;

    @Autowired
    public AuthController(
            UserRepository userRepository,
            AuthService authService,
            @Value("${jwt.secret}") String jwtSecret
    ) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.jwtSecret = jwtSecret;
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured");
        }
    }

    @GetMapping("/google/success")
    public RedirectView googleLoginSuccess(@AuthenticationPrincipal OAuth2User principal) {
        logger.info("Processing Google OAuth success");
        try {
            String googleId = principal.getAttribute("sub");
            String email = principal.getAttribute("email");
            String name = principal.getAttribute("name");
            String picture = principal.getAttribute("picture");

            String profilePictureUrl = (picture != null && !picture.trim().isEmpty()) ? picture : "https://via.placeholder.com/150";

            if (googleId == null || email == null) {
                logger.error("Google ID or email is null");
                throw new IllegalStateException("Google ID or email cannot be null");
            }

            User user = userRepository.findByGoogleId(googleId);
            if (user == null) {
                User existingUserByEmail = userRepository.findByEmail(email);
                if (existingUserByEmail != null) {
                    existingUserByEmail.setGoogleId(googleId);
                    existingUserByEmail.setName(name);
                    existingUserByEmail.setProfilePictureUrl(profilePictureUrl);
                    userRepository.save(existingUserByEmail);
                    user = existingUserByEmail;
                    logger.info("Updated existing user with email: {}", email);
                } else {
                    user = new User();
                    user.setGoogleId(googleId);
                    user.setEmail(email);
                    user.setName(name);
                    user.setProfilePictureUrl(profilePictureUrl);
                    user.setCreatedAt(LocalDateTime.now());
                    userRepository.save(user);
                    logger.info("Created new user with email: {}", email);
                }
            } else {
                user.setName(name);
                user.setProfilePictureUrl(profilePictureUrl);
                userRepository.save(user);
                logger.info("Updated existing user with ID: {}", user.getId());
            }

            String token = Jwts.builder()
                    .subject(user.getEmail())
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 24 * 3600000))
                    .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .compact();

            logger.debug("Generated JWT for user: {}", user.getEmail());
            String redirectUrl = "http://localhost:5173/login?token=" + token;
            return new RedirectView(redirectUrl);
        } catch (Exception e) {
            logger.error("Error in Google OAuth: {}", e.getMessage());
            return new RedirectView("http://localhost:5173/login?error=true");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> request) {
        logger.info("Processing registration request");
        try {
            String email = request.get("email");
            String password = request.get("password");
            String name = request.get("name");

            User user = authService.register(email, password, name);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", user.getId());
            logger.info("User registered successfully with email: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during registration: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        logger.info("Processing email/password login request");
        try {
            String email = request.get("email");
            String password = request.get("password");

            String token = authService.login(email, password);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            logger.info("User logged in successfully with email: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during login: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}