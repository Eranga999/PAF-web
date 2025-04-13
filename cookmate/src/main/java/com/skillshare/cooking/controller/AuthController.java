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
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final String jwtSecret;

    public AuthController(UserRepository userRepository, @Value("${jwt.secret}") String jwtSecret) {
        this.userRepository = userRepository;
        this.jwtSecret = jwtSecret;
        System.out.println("AuthController - JWT Secret: " + (jwtSecret != null ? jwtSecret : "null"));
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured in application.properties");
        }
    }

    @GetMapping("/google/success")
    public RedirectView googleLoginSuccess(@AuthenticationPrincipal OAuth2User principal) {
        System.out.println("AuthController - Entered /auth/google/success");
        try {
            System.out.println("AuthController - OAuth2User attributes: " + principal.getAttributes());
            String googleId = principal.getAttribute("sub");
            String email = principal.getAttribute("email");
            String name = principal.getAttribute("name");
            String picture = principal.getAttribute("picture");
            System.out.println("AuthController - Google user info - ID: " + googleId + ", Email: " + email + ", Name: " + name + ", Picture: " + picture);

            // Set a default profile picture if picture is null or empty
            String profilePictureUrl = (picture != null && !picture.trim().isEmpty()) ? picture : "https://via.placeholder.com/150";
            System.out.println("AuthController - Using profile picture URL: " + profilePictureUrl);

            if (googleId == null || email == null) {
                System.out.println("AuthController - Error: Google ID (sub) or email is null");
                throw new IllegalStateException("Google ID (sub) or email cannot be null");
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
                    System.out.println("AuthController - Updated existing user with email: " + email);
                } else {
                    user = new User();
                    user.setGoogleId(googleId);
                    user.setEmail(email);
                    user.setName(name);
                    user.setProfilePictureUrl(profilePictureUrl);
                    user.setCreatedAt(LocalDateTime.now());
                    userRepository.save(user);
                    System.out.println("AuthController - Created new user with email: " + email);
                }
            } else {
                // Update fields for existing user
                user.setName(name);
                user.setProfilePictureUrl(profilePictureUrl);
                userRepository.save(user);
                System.out.println("AuthController - Updated existing user with ID: " + user.getId());
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("email", user.getEmail());
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(user.getEmail())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 24 * 3600000)) // 1 day
                    .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .compact();
            System.out.println("AuthController - Generated JWT token: " + token.substring(0, 10) + "...");

            String redirectUrl = "http://localhost:5173/login?token=" + token;
            System.out.println("AuthController - Redirecting to: " + redirectUrl);
            return new RedirectView(redirectUrl);
        } catch (Exception e) {
            System.err.println("AuthController - Error in googleLoginSuccess: " + e.getMessage());
            e.printStackTrace();
            return new RedirectView("http://localhost:5173/login?error=true");
        }
    }
}