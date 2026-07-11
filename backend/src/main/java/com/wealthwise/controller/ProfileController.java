package com.wealthwise.controller;

import com.wealthwise.model.RiskProfile;
import com.wealthwise.model.enums.RiskLevel;
import com.wealthwise.repository.RiskProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Profile management endpoints — allows users to update their risk profile.
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final RiskProfileRepository riskProfileRepository;

    public ProfileController(RiskProfileRepository riskProfileRepository) {
        this.riskProfileRepository = riskProfileRepository;
    }

    /**
     * PUT /api/profile/risk
     * Updates the authenticated user's risk level.
     * Body: { "riskLevel": "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE" }
     */
    @PutMapping("/risk")
    public ResponseEntity<?> updateRiskLevel(
            Authentication auth,
            @RequestBody Map<String, String> body) {

        String userId = auth.getPrincipal().toString();
        UUID uid = UUID.fromString(userId);

        String riskLevelStr = body.get("riskLevel");
        if (riskLevelStr == null || riskLevelStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "riskLevel is required"));
        }

        RiskLevel newRisk;
        try {
            newRisk = RiskLevel.valueOf(riskLevelStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid riskLevel: " + riskLevelStr));
        }

        RiskProfile profile = riskProfileRepository.findByUserId(uid)
                .orElseThrow(() -> new IllegalArgumentException("Risk profile not found for user: " + userId));

        profile.setRiskLevel(newRisk);
        profile.setAssessedAt(LocalDateTime.now());
        riskProfileRepository.save(profile);

        return ResponseEntity.ok(Map.of(
                "message", "Risk profile updated successfully",
                "riskLevel", newRisk.name()
        ));
    }

    /**
     * GET /api/profile
     * Returns the authenticated user's risk profile summary.
     */
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        String userId = auth.getPrincipal().toString();
        UUID uid = UUID.fromString(userId);

        RiskProfile profile = riskProfileRepository.findByUserId(uid)
                .orElseThrow(() -> new IllegalArgumentException("Risk profile not found for user: " + userId));

        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "riskLevel", profile.getRiskLevel().name(),
                "investmentHorizonYears", profile.getInvestmentHorizonYears() != null ? profile.getInvestmentHorizonYears() : 5,
                "hasAlternateAssetExperience", profile.getHasAlternateAssetExperience(),
                "assessedAt", profile.getAssessedAt() != null ? profile.getAssessedAt().toString() : null
        ));
    }
}
