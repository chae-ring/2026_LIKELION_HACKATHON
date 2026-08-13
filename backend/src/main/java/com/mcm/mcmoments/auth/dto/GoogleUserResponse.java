package com.mcm.mcmoments.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleUserResponse {

    private String id;
    private String email;
}