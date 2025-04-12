package com.skillshare.cooking.controller;

import com.skillshare.cooking.entity.User;
import com.skillshare.cooking.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    @Value("${jwt.secret}")
    private String jwtSecret;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/google/success")
    public RedirectView googleLoginSuccess(@AuthenticationPrincipal OAuth2User principal) {
        System.out.println("Processing /auth/google/success");
        // Extract user info from OAuth2User
        String googleId = principal.getAttribute("sub");
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        System.out.println("Google user info - ID: " + googleId + ", Email: " + email + ", Name: " + name);

        // Ensure googleId is not null
        if (googleId == null) {
            System.out.println("Error: Google ID (sub) is null");
            throw new IllegalStateException("Google ID (sub) cannot be null");
        }

        // Find or create user in MongoDB
        User user = userRepository.findByGoogleId(googleId);
        if (user == null) {
            // Check if email already exists (to avoid duplicates)
            User existingUserByEmail = userRepository.findByEmail(email);
            if (existingUserByEmail != null) {
                existingUserByEmail.setGoogleId(googleId);
                existingUserByEmail.setName(name);
                userRepository.save(existingUserByEmail);
                user = existingUserByEmail;
                System.out.println("Updated existing user with email: " + email);
            } else {
                user = new User();
                user.setGoogleId(googleId);
                user.setEmail(email);
                user.setName(name);
                userRepository.save(user);
                System.out.println("Created new user with email: " + email);
            }
        } else {
            System.out.println("Found existing user with ID: " + user.getId());
        }

        // Generate JWT
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        String token = Jwts.builder()
            .claims(claims)
            .subject(user.getEmail())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 3600000))
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
            .compact();
        System.out.println("Generated JWT token: " + token);

        // Redirect to frontend PostCard page with token
        String redirectUrl = "http://localhost:5173/post?token=" + token;
        System.out.println("Redirecting to: " + redirectUrl);
        return new RedirectView(redirectUrl);
    }
}