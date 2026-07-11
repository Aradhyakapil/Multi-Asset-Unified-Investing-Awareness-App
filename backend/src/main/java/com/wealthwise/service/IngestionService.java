package com.wealthwise.service;

import com.wealthwise.event.PortfolioUpdatedEvent;
import com.wealthwise.model.PortfolioItem;
import com.wealthwise.model.User;
import com.wealthwise.model.enums.AssetType;
import com.wealthwise.model.enums.BrokerSource;
import com.wealthwise.repository.PortfolioItemRepository;
import com.wealthwise.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Mock ingestion service — simulates fetching data from Account Aggregator (AA)
 * and Consolidated Account Statement (CAS) sources.
 * Uses @Async for non-blocking ingestion and publishes PortfolioUpdatedEvent
 * on completion to trigger cache invalidation.
 */
@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final PortfolioItemRepository portfolioItemRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public IngestionService(PortfolioItemRepository portfolioItemRepository,
                            UserRepository userRepository,
                            ApplicationEventPublisher eventPublisher) {
        this.portfolioItemRepository = portfolioItemRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Triggers an async mock ingestion that simulates pulling data from
     * multiple brokers and upserting into the unified portfolio schema.
     */
    @Async
    @Transactional
    public void triggerSync(String userId) {
        UUID uid = UUID.fromString(userId);
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        log.info("Starting mock ingestion sync for user: {}", userId);

        // Simulate fetching from multiple sources
        List<PortfolioItem> mockData = generateMockIngestionData(user);
        int upsertCount = 0;

        for (PortfolioItem incoming : mockData) {
            Optional<PortfolioItem> existing = portfolioItemRepository
                    .findByUserIdAndTickerAndBrokerSource(uid, incoming.getTicker(), incoming.getBrokerSource());

            if (existing.isPresent()) {
                // Update existing holding with new price
                PortfolioItem item = existing.get();
                item.setCurrentPrice(incoming.getCurrentPrice());
                item.setLastUpdated(LocalDate.now());
                portfolioItemRepository.save(item);
            } else {
                // Insert new holding
                portfolioItemRepository.save(incoming);
            }
            upsertCount++;
        }

        log.info("Ingestion complete for user {}: {} items processed", userId, upsertCount);

        // Fire event to invalidate cache
        eventPublisher.publishEvent(new PortfolioUpdatedEvent(this, uid, upsertCount));
    }

    /**
     * Generates mock portfolio data simulating data from different brokers.
     * This represents what an AA adapter or CAS parser would produce.
     */
    private List<PortfolioItem> generateMockIngestionData(User user) {
        List<PortfolioItem> items = new ArrayList<>();
        Random rng = new Random();

        // Simulate price fluctuation (±5%)
        double fluctuation = 0.95 + rng.nextDouble() * 0.10;

        // New items from "Account Aggregator" sync
        items.add(PortfolioItem.builder()
                .user(user).assetType(AssetType.EQUITY).ticker("BAJFINANCE")
                .assetName("Bajaj Finance Ltd").quantity(BigDecimal.valueOf(8))
                .avgBuyPrice(BigDecimal.valueOf(6800)).currentPrice(BigDecimal.valueOf(7200 * fluctuation))
                .brokerSource(BrokerSource.ACCOUNT_AGGREGATOR).sector("Financial Services")
                .lastUpdated(LocalDate.now()).build());

        items.add(PortfolioItem.builder()
                .user(user).assetType(AssetType.CORPORATE_BOND).ticker("HDFCBOND25")
                .assetName("HDFC Corp Bond 2025 8.5%").quantity(BigDecimal.valueOf(50))
                .avgBuyPrice(BigDecimal.valueOf(1000)).currentPrice(BigDecimal.valueOf(1020 * fluctuation))
                .brokerSource(BrokerSource.ACCOUNT_AGGREGATOR).sector("Financial Services")
                .lastUpdated(LocalDate.now()).build());

        return items;
    }
}
