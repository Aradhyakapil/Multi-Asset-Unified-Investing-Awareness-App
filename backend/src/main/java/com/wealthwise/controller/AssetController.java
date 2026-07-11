package com.wealthwise.controller;

import com.wealthwise.dto.AssetDiscoveryDTO;
import com.wealthwise.service.AssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    /**
     * GET /api/assets/discover?assetType=REIT&riskLevel=MODERATE
     * Public endpoint — returns filterable list of investable assets.
     */
    @GetMapping("/discover")
    public ResponseEntity<List<AssetDiscoveryDTO>> discover(
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false) String riskLevel) {
        return ResponseEntity.ok(assetService.discoverAssets(assetType, riskLevel));
    }

    /**
     * GET /api/assets/{id}
     * Returns details of a single asset.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AssetDiscoveryDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    /**
     * GET /api/assets/alternate
     * Returns only alternate assets (REITs, InvITs, Bonds).
     */
    @GetMapping("/alternate")
    public ResponseEntity<List<AssetDiscoveryDTO>> getAlternate() {
        return ResponseEntity.ok(assetService.getAlternateAssets());
    }
}
