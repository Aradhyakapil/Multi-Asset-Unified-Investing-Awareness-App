package com.wealthwise.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listens for PortfolioUpdatedEvent and invalidates the
 * relevant user's cached dashboard data.
 */
@Component
public class PortfolioEventListener {

    private static final Logger log = LoggerFactory.getLogger(PortfolioEventListener.class);

    private final CacheManager cacheManager;

    public PortfolioEventListener(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @EventListener
    public void onPortfolioUpdated(PortfolioUpdatedEvent event) {
        log.info("Portfolio updated for user {}: {} items synced. Invalidating cache...",
                event.getUserId(), event.getItemsUpdated());

        // Invalidate the user's portfolio summary cache
        var cache = cacheManager.getCache("portfolioSummary");
        if (cache != null) {
            cache.evict(event.getUserId().toString());
            log.info("Cache invalidated for user {}", event.getUserId());
        }
    }
}
