package com.wealthwise.controller;

import com.wealthwise.dto.PortfolioSummaryDTO;
import com.wealthwise.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    /**
     * GET /api/portfolio/summary
     * Returns full portfolio summary including net worth, allocation, and performance.
     * Response is cached per user — invalidated on ingestion events.
     */
    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummaryDTO> getSummary(Authentication auth) {
        String userId = auth.getPrincipal().toString();
        return ResponseEntity.ok(portfolioService.getPortfolioSummary(userId));
    }

    /**
     * GET /api/portfolio/holdings
     * Returns all holdings across all brokers for the authenticated user.
     */
    @GetMapping("/holdings")
    public ResponseEntity<?> getHoldings(Authentication auth) {
        String userId = auth.getPrincipal().toString();
        return ResponseEntity.ok(portfolioService.getAllHoldings(userId));
    }
}
