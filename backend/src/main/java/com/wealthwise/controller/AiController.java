package com.wealthwise.controller;

import com.wealthwise.dto.AiChatDTO;
import com.wealthwise.dto.SuitabilityResponseDTO;
import com.wealthwise.service.AiSuitabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiSuitabilityService aiService;

    public AiController(AiSuitabilityService aiService) {
        this.aiService = aiService;
    }

    /**
     * POST /api/ai/suitability
     * Evaluates asset suitability against user's risk profile.
     */
    @PostMapping("/suitability")
    public ResponseEntity<SuitabilityResponseDTO> evaluateSuitability(
            @RequestBody AiChatDTO.SuitabilityRequest request,
            Authentication auth) {
        String userId = request.getUserId() != null ? request.getUserId() : auth.getPrincipal().toString();
        return ResponseEntity.ok(aiService.evaluateSuitability(userId, request.getAssetId()));
    }

    /**
     * POST /api/ai/chat
     * AI co-pilot chat endpoint with Hinglish/English support.
     */
    @PostMapping("/chat")
    public ResponseEntity<AiChatDTO.ChatResponse> chat(
            @RequestBody AiChatDTO.ChatRequest request,
            Authentication auth) {
        String userId = request.getUserId() != null ? request.getUserId() : auth.getPrincipal().toString();
        return ResponseEntity.ok(aiService.chat(userId, request.getMessage(), request.getAssetId()));
    }

    /**
     * POST /api/ai/knowledge-check
     * Generates pre-investment knowledge quiz questions.
     */
    @PostMapping("/knowledge-check")
    public ResponseEntity<AiChatDTO.KnowledgeCheckResponse> knowledgeCheck(
            @RequestBody AiChatDTO.KnowledgeCheckRequest request) {
        return ResponseEntity.ok(aiService.generateKnowledgeCheck(request.getAssetId()));
    }
}
