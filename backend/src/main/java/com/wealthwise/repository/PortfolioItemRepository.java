package com.wealthwise.repository;

import com.wealthwise.model.PortfolioItem;
import com.wealthwise.model.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, UUID> {

    /** All holdings for a user — data-scoped for DPDP compliance */
    List<PortfolioItem> findByUserId(UUID userId);

    /** Holdings filtered by asset type */
    List<PortfolioItem> findByUserIdAndAssetType(UUID userId, AssetType assetType);

    /** Upsert support: find existing holding by user + ticker + broker */
    Optional<PortfolioItem> findByUserIdAndTickerAndBrokerSource(
            UUID userId, String ticker, com.wealthwise.model.enums.BrokerSource brokerSource);

    /** Asset allocation summary — grouped totals at DB level for efficiency */
    @Query("SELECT p.assetType, SUM(p.quantity * p.currentPrice) " +
           "FROM PortfolioItem p WHERE p.user.id = :userId GROUP BY p.assetType")
    List<Object[]> getAssetAllocationByUserId(@Param("userId") UUID userId);

    /** Sector concentration summary */
    @Query("SELECT p.sector, SUM(p.quantity * p.currentPrice) " +
           "FROM PortfolioItem p WHERE p.user.id = :userId AND p.sector IS NOT NULL " +
           "GROUP BY p.sector ORDER BY SUM(p.quantity * p.currentPrice) DESC")
    List<Object[]> getSectorConcentrationByUserId(@Param("userId") UUID userId);
}
