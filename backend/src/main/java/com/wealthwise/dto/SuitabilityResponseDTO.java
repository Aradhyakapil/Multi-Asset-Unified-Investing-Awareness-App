package com.wealthwise.dto;

import lombok.*;
import java.util.List;

/**
 * Response from the AI suitability engine.
 * Contains the AI assessment and structured data for the frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuitabilityResponseDTO {

    /** Overall suitability: SUITABLE, MODERATE_FIT, NOT_SUITABLE */
    private String suitabilityRating;

    /** Score from 0-100 */
    private Integer suitabilityScore;

    /** Detailed AI-generated explanation (supports Hinglish) */
    private String explanation;

    /** Key risk factors identified */
    private List<String> riskFactors;

    /** Key benefits for this user */
    private List<String> benefits;

    /** Whether this used AI or static fallback */
    private Boolean aiGenerated;

    /** Asset name for context */
    private String assetName;

    /** User's risk profile level */
    private String userRiskLevel;
}
