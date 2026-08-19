package com.mcm.mcmoments.global.config;

import com.mcm.mcmoments.auth.handler.OAuth2SuccessHandler;
import com.mcm.mcmoments.auth.service.CustomOAuth2UserService;
import com.mcm.mcmoments.global.jwt.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin())
                )

                .authorizeHttpRequests(auth ->
                        auth
                                // 로그인 / OAuth 관련 경로는 인증 없이 접근 가능
                                .requestMatchers(
                                        "/api/v1/auth/**",
                                        "/oauth2/**",
                                        "/login/**",
                                        "/error",

                                        // 아트워크 이미지 조회는 img 태그에서
                                        // Authorization 헤더를 붙일 수 없으므로 공개
                                        "/api/v1/artworks/*/image"
                                )
                                .permitAll()

                                // 실제 API는 JWT 인증 필요
                                .requestMatchers("/api/v1/**")
                                .authenticated()

                                // 프론트 정적 파일 등은 허용
                                .anyRequest()
                                .permitAll()
                )

                // Google OAuth2 로그인
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2SuccessHandler)
                )

                // JWT 인증 필터
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}