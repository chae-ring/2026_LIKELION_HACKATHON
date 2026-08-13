package com.mcm.mcmoments.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GoogleLoginResponse {

    private String redirectUrl;
}