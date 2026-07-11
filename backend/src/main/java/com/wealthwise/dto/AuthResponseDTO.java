package com.wealthwise.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private String userId;
    private String email;
    private String fullName;
    private String riskLevel;
}
