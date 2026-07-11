package com.wealthwise.repository;

import com.wealthwise.model.AssetMaster;
import com.wealthwise.model.enums.AssetType;
import com.wealthwise.model.enums.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetMasterRepository extends JpaRepository<AssetMaster, UUID> {

    Optional<AssetMaster> findByTicker(String ticker);

    List<AssetMaster> findByAssetType(AssetType assetType);

    List<AssetMaster> findByRiskLevel(RiskLevel riskLevel);

    List<AssetMaster> findByIsAlternateAssetTrue();

    List<AssetMaster> findByAssetTypeAndRiskLevel(AssetType assetType, RiskLevel riskLevel);

    List<AssetMaster> findByMinInvestmentLessThanEqual(BigDecimal maxAmount);
}
