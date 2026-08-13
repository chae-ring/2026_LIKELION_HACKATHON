package com.mcm.mcmoments.global.jwt;

import com.mcm.mcmoments.user.entity.User;
import com.mcm.mcmoments.user.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        // Authorization 헤더가 없거나 Bearer 형식이 아니면 그냥 다음 필터로
        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // "Bearer " 제거하고 JWT만 추출
        String token = authorizationHeader.substring(7);

        try {
            // JWT 안에 저장한 userId 가져오기
            Long userId = jwtProvider.getUserId(token);

            // DB에서 사용자 조회
            User user = userRepository.findById(userId)
                    .orElse(null);

            if (user != null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.emptyList()
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception e) {
            // 토큰이 잘못됐거나 만료된 경우
            // 인증 없이 다음 필터로 넘김
        }

        filterChain.doFilter(request, response);
    }
}