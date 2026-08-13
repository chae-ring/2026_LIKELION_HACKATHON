package com.mcm.mcmoments.auth.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mcm.mcmoments.auth.dto.GoogleCallbackResponse;
import com.mcm.mcmoments.auth.dto.GoogleLoginResponse;
import com.mcm.mcmoments.global.jwt.JwtProvider;
import com.mcm.mcmoments.user.entity.User;
import com.mcm.mcmoments.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    private final RestClient restClient = RestClient.create();

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    public GoogleLoginResponse getGoogleLoginUrl() {

        String redirectUrl = UriComponentsBuilder
                .fromUriString(
                        "https://accounts.google.com/o/oauth2/v2/auth"
                )
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .build()
                .toUriString();

        return new GoogleLoginResponse(redirectUrl);
    }

    @Transactional
    public GoogleCallbackResponse callback(String code) {

        GoogleTokenResponse tokenResponse =
                requestGoogleToken(code);

        GoogleUserResponse googleUser =
                requestGoogleUser(
                        tokenResponse.accessToken()
                );

        User user = userRepository
                .findByGoogleId(googleUser.id())
                .orElseGet(() ->
                        userRepository.save(
                                User.create(
                                        googleUser.id(),
                                        googleUser.email()
                                )
                        )
                );

        String accessToken =
                jwtProvider.createAccessToken(user);

        return new GoogleCallbackResponse(
                accessToken,
                new GoogleCallbackResponse.UserInfo(
                        user.getId(),
                        user.getEmail()
                )
        );
    }

    private GoogleTokenResponse requestGoogleToken(
            String code
    ) {

        MultiValueMap<String, String> body =
                new LinkedMultiValueMap<>();

        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add(
                "grant_type",
                "authorization_code"
        );

        return restClient.post()
                .uri(
                        "https://oauth2.googleapis.com/token"
                )
                .contentType(
                        MediaType.APPLICATION_FORM_URLENCODED
                )
                .body(body)
                .retrieve()
                .body(GoogleTokenResponse.class);
    }

    private GoogleUserResponse requestGoogleUser(
            String googleAccessToken
    ) {

        return restClient.get()
                .uri(
                        "https://www.googleapis.com/oauth2/v2/userinfo"
                )
                .headers(headers ->
                        headers.setBearerAuth(
                                googleAccessToken
                        )
                )
                .retrieve()
                .body(GoogleUserResponse.class);
    }

    private record GoogleTokenResponse(
            @JsonProperty("access_token")
            String accessToken
    ) {
    }

    private record GoogleUserResponse(
            String id,
            String email
    ) {
    }
}