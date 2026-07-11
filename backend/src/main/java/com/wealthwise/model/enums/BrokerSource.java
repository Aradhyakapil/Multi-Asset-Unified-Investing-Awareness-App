package com.wealthwise.model.enums;

/**
 * Source broker/depository from which portfolio data originates.
 * Used for deduplication and provenance tracking.
 */
public enum BrokerSource {
    ZERODHA,
    GROWW,
    NSDL,
    CDSL,
    ACCOUNT_AGGREGATOR
}
