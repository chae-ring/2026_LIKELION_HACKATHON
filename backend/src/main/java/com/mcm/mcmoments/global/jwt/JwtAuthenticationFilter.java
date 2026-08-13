package com.mcm.mcmoments.global.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            String token = authorizationHeader.substring(7);

            try {
                Long userId = jwtProvider.getUserId(token);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                Collections.emptyList()
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (Exception ignored) { // 토큰 검증 실패 시 무시하고 다음 필터로 진행, 추후 인증이 필요한 API를 authenticated()로 변경할 예정
            }
        }

        filterChain.doFilter(request, response);
    }
}