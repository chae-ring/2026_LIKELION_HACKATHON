package com.mcm.mcmoments.auth.controller;

import com.mcm.mcmoments.auth.dto.GoogleCallbackResponse;
import com.mcm.mcmoments.auth.dto.GoogleLoginResponse;
import com.mcm.mcmoments.auth.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    @GetMapping("/google")
    public ResponseEntity<GoogleLoginResponse> googleLogin() {

        return ResponseEntity.ok(
                googleAuthService.getGoogleLoginUrl()
        );
    }

    @GetMapping("/google/callback")
    public ResponseEntity<GoogleCallbackResponse> callback(
            @RequestParam String code
    ) {

        return ResponseEntity.ok(
                googleAuthService.callback(code)
        );
    }
}