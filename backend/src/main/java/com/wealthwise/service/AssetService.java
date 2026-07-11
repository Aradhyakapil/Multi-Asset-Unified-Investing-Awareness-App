package com.wealthwise.service;

import com.wealthwise.dto.AssetDiscoveryDTO;
import com.wealthwise.model.AssetMaster;
import com.wealthwise.model.enums.AssetType;
import com.wealthwise.model.enums.RiskLevel;
import com.wealthwise.repository.AssetMasterRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for asset discovery and catalog browsing.
 */
@Service
public class AssetService {

    private final AssetMasterRepository assetMasterRepository;

    public AssetService(AssetMasterRepository assetMasterRepository) {
        this.assetMasterRepository = assetMasterRepository;
    }

    /**
     * Returns filterable list of assets for the Discovery Hub.
     */
    public List<AssetDiscoveryDTO> discoverAssets(String assetType, String riskLevel) {
        List<AssetMaster> assets;

        if (assetType != null && riskLevel != null) {
            assets = assetMasterRepository.findByAssetTypeAndRiskLevel(
                    AssetType.valueOf(assetType), RiskLevel.valueOf(riskLevel));
        } else if (assetType != null) {
            assets = assetMasterRepository.findByAssetType(AssetType.valueOf(assetType));
        } else if (riskLevel != null) {
            assets = assetMasterRepository.findByRiskLevel(RiskLevel.valueOf(riskLevel));
        } else {
            assets = assetMasterRepository.findAll();
        }

        return assets.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Returns a single asset by ID.
     */
    public AssetDiscoveryDTO getAssetById(String assetId) {
        AssetMaster asset = assetMasterRepository.findById(UUID.fromString(assetId))
                .orElseThrow(() -> new IllegalArgumentException("Asset not found: " + assetId));
        return toDTO(asset);
    }

    /**
     * Returns only alternate assets (REITs, InvITs, Bonds).
     */
    public List<AssetDiscoveryDTO> getAlternateAssets() {
        return assetMasterRepository.findByIsAlternateAssetTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private AssetDiscoveryDTO toDTO(AssetMaster asset) {
        return AssetDiscoveryDTO.builder()
                .id(asset.getId().toString())
                .ticker(asset.getTicker())
                .name(asset.getName())
                .issuer(asset.getIssuer())
                .description(asset.getDescription())
                .assetType(asset.getAssetType().name())
                .currentPrice(asset.getCurrentPrice())
                .yieldPercent(asset.getYieldPercent())
                .minInvestment(asset.getMinInvestment())
                .riskLevel(asset.getRiskLevel() != null ? asset.getRiskLevel().name() : null)
                .sector(asset.getSector())
                .isAlternateAsset(asset.getIsAlternateAsset())
                .factsheetRef(asset.getFactsheetRef())
                .build();
    }
}
