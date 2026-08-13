package com.mcm.mcmoments.auth.handler;

import com.mcm.mcmoments.global.jwt.JwtProvider;
import com.mcm.mcmoments.user.entity.User;
import com.mcm.mcmoments.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauth2User =
                (OAuth2User) authentication.getPrincipal();

        System.out.println(
                "Google attributes = " + oauth2User.getAttributes()
        );

        String googleId = oauth2User.getAttribute("sub");

        User user = userRepository.findByGoogleId(googleId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

        String accessToken =
                jwtProvider.createAccessToken(user);

        response.setContentType(
                "application/json;charset=UTF-8"
        );

        response.getWriter().write(
                """
                {
                    "accessToken": "%s",
                    "userId": %d,
                    "email": "%s"
                }
                """.formatted(
                        accessToken,
                        user.getId(),
                        user.getEmail()
                )
        );
    }
}