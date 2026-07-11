package com.wealthwise.model;

import com.wealthwise.model.enums.AssetType;
import com.wealthwise.model.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Master catalog of investable assets — equities, REITs, InvITs,
 * corporate bonds, and government bonds.
 * Used by the Discovery Hub and the AI suitability engine.
 */
@Entity
@Table(name = "asset_master")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AssetMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetType assetType;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String issuer;

    @Column(length = 2000)
    private String description;

    @Column(precision = 18, scale = 4)
    private BigDecimal currentPrice;

    /** Dividend or interest yield as a percentage */
    @Column(precision = 8, scale = 4)
    private BigDecimal yieldPercent;

    @Column(precision = 18, scale = 2)
    private BigDecimal minInvestment;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private RiskLevel riskLevel;

    @Column(length = 50)
    private String sector;

    /** Reference to the RAG factsheet document name */
    @Column(length = 100)
    private String factsheetRef;

    /** True for REITs, InvITs, Bonds — distinguishes alternate assets */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isAlternateAsset = false;

    private LocalDateTime listedDate;
}
