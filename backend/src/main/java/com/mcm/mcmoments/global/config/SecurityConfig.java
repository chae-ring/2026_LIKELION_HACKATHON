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

                        // Google 사용자 정보 받은 뒤 실행
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )

                        // 로그인 최종 성공 후 실행
                        .successHandler(oAuth2SuccessHandler)
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}