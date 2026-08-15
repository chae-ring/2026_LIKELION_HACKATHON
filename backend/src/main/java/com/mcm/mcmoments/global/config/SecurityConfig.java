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

                // H2 콘솔이 내부적으로 iframe을 사용하므로, 기본값(DENY)이면 콘솔 화면이 빈 화면으로 뜬다.
                // sameOrigin()은 같은 출처(우리 서버)에서의 프레임만 허용 — 다른 사이트가 우리 페이지를 감싸는 건 여전히 막힘.
                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin())
                )

                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers(
                                        "/api/v1/auth/**",
                                        "/oauth2/**",
                                        "/login/**"
                                )
                                .permitAll()

                                .anyRequest()
                                .permitAll() // 나중에 authenticated()로 변경
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
