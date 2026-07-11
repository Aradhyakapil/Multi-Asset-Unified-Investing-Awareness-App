package com.wealthwise.dto;

import lombok.*;
import java.util.List;

/**
 * AI chat request/response DTOs.
 */
public class AiChatDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private String userId;
        private String message;
        private String assetId; // optional context
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatResponse {
        private String response;
        private Boolean aiGenerated;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuitabilityRequest {
        private String userId;
        private String assetId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KnowledgeCheckRequest {
        private String assetId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KnowledgeCheckResponse {
        private String assetName;
        private List<Question> questions;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Question {
            private String question;
            private List<String> options;
            private Integer correctIndex;
            private String explanation;
        }
    }
}
