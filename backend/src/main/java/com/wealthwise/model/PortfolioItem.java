package com.wealthwise.model;

import com.wealthwise.model.enums.AssetType;
import com.wealthwise.model.enums.BrokerSource;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Represents a single holding in a user's unified portfolio.
 * Unique constraint on (user, ticker, brokerSource) prevents
 * double-counting the same asset from the same source.
 */
@Entity
@Table(name = "portfolio_items",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"user_id", "ticker", "broker_source"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetType assetType;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(nullable = false, length = 100)
    private String assetName;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal avgBuyPrice;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal currentPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "broker_source", nullable = false, length = 25)
    private BrokerSource brokerSource;

    @Column(length = 50)
    private String sector;

    private LocalDate lastUpdated;

    /**
     * Computes total current value of this holding.
     */
    @Transient
    public BigDecimal getCurrentValue() {
        return quantity.multiply(currentPrice);
    }

    /**
     * Computes total invested value of this holding.
     */
    @Transient
    public BigDecimal getInvestedValue() {
        return quantity.multiply(avgBuyPrice);
    }

    /**
     * Computes P&L for this holding.
     */
    @Transient
    public BigDecimal getPnl() {
        return getCurrentValue().subtract(getInvestedValue());
    }
}
