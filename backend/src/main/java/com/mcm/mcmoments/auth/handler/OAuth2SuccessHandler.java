package com.mcm.mcmoments.auth.handler;

import com.mcm.mcmoments.global.jwt.JwtProvider;
import com.mcm.mcmoments.user.entity.User;
import com.mcm.mcmoments.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        /*
         * Google 로그인 사용자 정보
         */
        OAuth2User oauth2User =
                (OAuth2User) authentication.getPrincipal();

        System.out.println(
                "Google attributes = "
                        + oauth2User.getAttributes()
        );

        /*
         * Google 고유 사용자 ID
         */
        String googleId =
                oauth2User.getAttribute("sub");

        /*
         * CustomOAuth2UserService에서
         * DB에 저장한 사용자 조회
         */
        User user =
                userRepository
                        .findByGoogleId(googleId)
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "사용자를 찾을 수 없습니다."
                                        )
                        );

        /*
         * JWT 발급
         */
        String accessToken =
                jwtProvider
                        .createAccessToken(user);

        /*
         * URL에 들어갈 수 있도록 인코딩
         */
        String encodedToken =
                URLEncoder.encode(
                        accessToken,
                        StandardCharsets.UTF_8
                );

        /*
         * 프론트 개발 서버
         *
         * 현재 Vite:
         * http://localhost:8443
         */
        String redirectUrl =
                "http://localhost:8443"
                        + "/?accessToken="
                        + encodedToken
                        + "&userId="
                        + user.getId();

        /*
         * JSON을 출력하는 게 아니라
         * 프론트로 다시 이동
         */
        response.sendRedirect(
                redirectUrl
        );
    }
}