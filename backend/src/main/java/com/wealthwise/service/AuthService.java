package com.wealthwise.service;

import com.wealthwise.dto.AuthRequestDTO;
import com.wealthwise.dto.AuthResponseDTO;
import com.wealthwise.model.RiskProfile;
import com.wealthwise.model.User;
import com.wealthwise.model.enums.RiskLevel;
import com.wealthwise.repository.UserRepository;
import com.wealthwise.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Handles user registration and login with JWT token generation.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponseDTO register(AuthRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .panNumber(request.getPanNumber())
                .build();

        // Create default risk profile (MODERATE)
        RiskProfile riskProfile = RiskProfile.builder()
                .user(user)
                .riskLevel(RiskLevel.MODERATE)
                .investmentHorizonYears(5)
                .annualIncome(BigDecimal.valueOf(1200000))
                .existingDebt(BigDecimal.ZERO)
                .hasAlternateAssetExperience(false)
                .assessedAt(LocalDateTime.now())
                .build();
        user.setRiskProfile(riskProfile);

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId().toString(), user.getEmail());

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .riskLevel(riskProfile.getRiskLevel().name())
                .build();
    }

    public AuthResponseDTO login(AuthRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId().toString(), user.getEmail());

        String riskLevel = user.getRiskProfile() != null
                ? user.getRiskProfile().getRiskLevel().name()
                : "MODERATE";

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .riskLevel(riskLevel)
                .build();
    }
}
