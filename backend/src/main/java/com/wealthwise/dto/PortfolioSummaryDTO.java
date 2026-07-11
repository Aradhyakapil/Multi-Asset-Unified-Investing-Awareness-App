package com.wealthwise.dto;

import com.wealthwise.model.enums.AssetType;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive portfolio summary returned by the dashboard API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSummaryDTO {

    private BigDecimal totalNetWorth;
    private BigDecimal totalInvested;
    private BigDecimal totalPnl;
    private BigDecimal pnlPercentage;

    /** Asset allocation breakdown: AssetType -> current value */
    private List<AllocationSlice> assetAllocation;

    /** Sector concentration: sector name -> current value */
    private List<AllocationSlice> sectorConcentration;

    /** Top holdings by value */
    private List<HoldingDTO> topHoldings;

    /** Historical performance data points for charting */
    private List<PerformancePoint> performanceHistory;

    /** Broker-wise value split */
    private List<AllocationSlice> brokerSplit;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationSlice {
        private String label;
        private BigDecimal value;
        private BigDecimal percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HoldingDTO {
        private String id;
        private String ticker;
        private String assetName;
        private String assetType;
        private BigDecimal quantity;
        private BigDecimal avgBuyPrice;
        private BigDecimal currentPrice;
        private BigDecimal currentValue;
        private BigDecimal pnl;
        private BigDecimal pnlPercentage;
        private String brokerSource;
        private String sector;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformancePoint {
        private String date;
        private BigDecimal value;
    }
}
