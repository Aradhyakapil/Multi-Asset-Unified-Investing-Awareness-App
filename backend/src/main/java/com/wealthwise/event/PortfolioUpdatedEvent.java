package com.wealthwise.event;

import org.springframework.context.ApplicationEvent;
import java.util.UUID;

/**
 * Published after portfolio data ingestion completes.
 * Triggers cache invalidation and analytics recalculation.
 */
public class PortfolioUpdatedEvent extends ApplicationEvent {

    private final UUID userId;
    private final int itemsUpdated;

    public PortfolioUpdatedEvent(Object source, UUID userId, int itemsUpdated) {
        super(source);
        this.userId = userId;
        this.itemsUpdated = itemsUpdated;
    }

    public UUID getUserId() {
        return userId;
    }

    public int getItemsUpdated() {
        return itemsUpdated;
    }
}
