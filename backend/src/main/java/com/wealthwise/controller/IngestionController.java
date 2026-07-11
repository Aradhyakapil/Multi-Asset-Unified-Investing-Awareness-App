package com.wealthwise.controller;

import com.wealthwise.service.IngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ingestion")
public class IngestionController {

    private final IngestionService ingestionService;

    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    /**
     * POST /api/ingestion/sync
     * Triggers async mock ingestion from Account Aggregator / CAS sources.
     * Returns immediately — data is processed in the background.
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> triggerSync(Authentication auth) {
        String userId = auth.getPrincipal().toString();
        ingestionService.triggerSync(userId);
        return ResponseEntity.accepted().body(Map.of(
                "status", "SYNC_INITIATED",
                "message", "Portfolio sync initiated. Data will be updated in the background.",
                "userId", userId
        ));
    }
}
