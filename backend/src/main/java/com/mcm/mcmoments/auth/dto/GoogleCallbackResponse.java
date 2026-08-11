package com.mcm.mcmoments.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GoogleCallbackResponse {

    private String accessToken;
    private UserInfo user;

    @Getter
    @AllArgsConstructor
    public static class UserInfo {

        private Long id;
        private String email;
    }
}