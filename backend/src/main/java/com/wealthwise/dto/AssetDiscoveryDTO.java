package com.wealthwise.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * DTO for assets displayed in the Discovery Hub.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDiscoveryDTO {

    private String id;
    private String ticker;
    private String name;
    private String issuer;
    private String description;
    private String assetType;
    private BigDecimal currentPrice;
    private BigDecimal yieldPercent;
    private BigDecimal minInvestment;
    private String riskLevel;
    private String sector;
    private Boolean isAlternateAsset;
    private String factsheetRef;
}
