package com.mcm.mcmoments.auth.dto;

public record GoogleCallbackResponse(
        String accessToken,
        UserInfo user
) {

    public record UserInfo(
            Long id,
            String email
    ) {
    }
}