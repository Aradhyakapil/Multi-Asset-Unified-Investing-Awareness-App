package com.wealthwise.model;

import com.wealthwise.model.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stores the investor's risk assessment profile.
 * Used by the AI suitability engine to evaluate asset-user fit.
 */
@Entity
@Table(name = "risk_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RiskProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private RiskLevel riskLevel;

    private Integer investmentHorizonYears;

    @Column(precision = 18, scale = 2)
    private BigDecimal annualIncome;

    @Column(precision = 18, scale = 2)
    private BigDecimal existingDebt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean hasAlternateAssetExperience = false;

    private LocalDateTime assessedAt;
}
