package com.wealthwise.service;

import com.wealthwise.dto.PortfolioSummaryDTO;
import com.wealthwise.dto.PortfolioSummaryDTO.*;
import com.wealthwise.model.PortfolioItem;
import com.wealthwise.repository.PortfolioItemRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Portfolio analytics service — computes net worth, asset allocation,
 * sector concentration, and generates performance history.
 * Results are cached and invalidated on ingestion events.
 */
@Service
public class PortfolioService {

    private final PortfolioItemRepository portfolioItemRepository;

    public PortfolioService(PortfolioItemRepository portfolioItemRepository) {
        this.portfolioItemRepository = portfolioItemRepository;
    }

    /**
     * Returns the full portfolio summary for the dashboard.
     * Cached per user ID — invalidated when PortfolioUpdatedEvent fires.
     */
    @Cacheable(value = "portfolioSummary", key = "#userId")
    public PortfolioSummaryDTO getPortfolioSummary(String userId) {
        UUID uid = UUID.fromString(userId);
        List<PortfolioItem> items = portfolioItemRepository.findByUserId(uid);

        if (items.isEmpty()) {
            return PortfolioSummaryDTO.builder()
                    .totalNetWorth(BigDecimal.ZERO)
                    .totalInvested(BigDecimal.ZERO)
                    .totalPnl(BigDecimal.ZERO)
                    .pnlPercentage(BigDecimal.ZERO)
                    .assetAllocation(Collections.emptyList())
                    .sectorConcentration(Collections.emptyList())
                    .topHoldings(Collections.emptyList())
                    .performanceHistory(Collections.emptyList())
                    .brokerSplit(Collections.emptyList())
                    .build();
        }

        BigDecimal totalNetWorth = items.stream()
                .map(PortfolioItem::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalInvested = items.stream()
                .map(PortfolioItem::getInvestedValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPnl = totalNetWorth.subtract(totalInvested);

        BigDecimal pnlPercentage = totalInvested.compareTo(BigDecimal.ZERO) > 0
                ? totalPnl.multiply(BigDecimal.valueOf(100)).divide(totalInvested, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Asset allocation from DB-level aggregation
        List<AllocationSlice> assetAllocation = buildAssetAllocation(uid, totalNetWorth);

        // Sector concentration
        List<AllocationSlice> sectorConcentration = buildSectorConcentration(uid, totalNetWorth);

        // Broker split
        List<AllocationSlice> brokerSplit = buildBrokerSplit(items, totalNetWorth);

        // Top holdings (sorted by value, top 10)
        List<HoldingDTO> topHoldings = items.stream()
                .sorted(Comparator.comparing(PortfolioItem::getCurrentValue).reversed())
                .limit(10)
                .map(this::toHoldingDTO)
                .collect(Collectors.toList());

        // Simulated performance history (30 data points over past year)
        List<PerformancePoint> performanceHistory = generatePerformanceHistory(totalNetWorth);

        return PortfolioSummaryDTO.builder()
                .totalNetWorth(totalNetWorth.setScale(2, RoundingMode.HALF_UP))
                .totalInvested(totalInvested.setScale(2, RoundingMode.HALF_UP))
                .totalPnl(totalPnl.setScale(2, RoundingMode.HALF_UP))
                .pnlPercentage(pnlPercentage)
                .assetAllocation(assetAllocation)
                .sectorConcentration(sectorConcentration)
                .topHoldings(topHoldings)
                .performanceHistory(performanceHistory)
                .brokerSplit(brokerSplit)
                .build();
    }

    /**
     * Returns all holdings for the holdings table.
     */
    public List<HoldingDTO> getAllHoldings(String userId) {
        UUID uid = UUID.fromString(userId);
        return portfolioItemRepository.findByUserId(uid).stream()
                .map(this::toHoldingDTO)
                .collect(Collectors.toList());
    }

    private List<AllocationSlice> buildAssetAllocation(UUID userId, BigDecimal total) {
        List<Object[]> rows = portfolioItemRepository.getAssetAllocationByUserId(userId);
        return rows.stream().map(row -> {
            BigDecimal value = (BigDecimal) row[1];
            BigDecimal pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? value.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            return AllocationSlice.builder()
                    .label(row[0].toString())
                    .value(value.setScale(2, RoundingMode.HALF_UP))
                    .percentage(pct)
                    .build();
        }).collect(Collectors.toList());
    }

    private List<AllocationSlice> buildSectorConcentration(UUID userId, BigDecimal total) {
        List<Object[]> rows = portfolioItemRepository.getSectorConcentrationByUserId(userId);
        return rows.stream().map(row -> {
            BigDecimal value = (BigDecimal) row[1];
            BigDecimal pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? value.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            return AllocationSlice.builder()
                    .label((String) row[0])
                    .value(value.setScale(2, RoundingMode.HALF_UP))
                    .percentage(pct)
                    .build();
        }).collect(Collectors.toList());
    }

    private List<AllocationSlice> buildBrokerSplit(List<PortfolioItem> items, BigDecimal total) {
        Map<String, BigDecimal> brokerTotals = items.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getBrokerSource().name(),
                        Collectors.reducing(BigDecimal.ZERO, PortfolioItem::getCurrentValue, BigDecimal::add)));
        return brokerTotals.entrySet().stream().map(e -> {
            BigDecimal pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? e.getValue().multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            return AllocationSlice.builder()
                    .label(e.getKey())
                    .value(e.getValue().setScale(2, RoundingMode.HALF_UP))
                    .percentage(pct)
                    .build();
        }).collect(Collectors.toList());
    }

    private HoldingDTO toHoldingDTO(PortfolioItem item) {
        BigDecimal pnlPct = item.getInvestedValue().compareTo(BigDecimal.ZERO) > 0
                ? item.getPnl().multiply(BigDecimal.valueOf(100))
                    .divide(item.getInvestedValue(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return HoldingDTO.builder()
                .id(item.getId().toString())
                .ticker(item.getTicker())
                .assetName(item.getAssetName())
                .assetType(item.getAssetType().name())
                .quantity(item.getQuantity())
                .avgBuyPrice(item.getAvgBuyPrice())
                .currentPrice(item.getCurrentPrice())
                .currentValue(item.getCurrentValue().setScale(2, RoundingMode.HALF_UP))
                .pnl(item.getPnl().setScale(2, RoundingMode.HALF_UP))
                .pnlPercentage(pnlPct)
                .brokerSource(item.getBrokerSource().name())
                .sector(item.getSector())
                .build();
    }

    /**
     * Generates simulated historical performance data.
     * In production, this would come from a time-series data store.
     */
    private List<PerformancePoint> generatePerformanceHistory(BigDecimal currentValue) {
        List<PerformancePoint> history = new ArrayList<>();
        Random random = new Random(42); // deterministic for consistency
        LocalDate today = LocalDate.now();

        // Generate 12 monthly data points
        for (int i = 11; i >= 0; i--) {
            LocalDate date = today.minusMonths(i);
            // Simulate growth from ~70% of current value to 100%
            double factor = 0.70 + (0.30 * (12 - i) / 12.0) + (random.nextDouble() - 0.5) * 0.05;
            BigDecimal value = currentValue.multiply(BigDecimal.valueOf(factor))
                    .setScale(2, RoundingMode.HALF_UP);
            history.add(PerformancePoint.builder()
                    .date(date.toString())
                    .value(value)
                    .build());
        }
        return history;
    }
}
