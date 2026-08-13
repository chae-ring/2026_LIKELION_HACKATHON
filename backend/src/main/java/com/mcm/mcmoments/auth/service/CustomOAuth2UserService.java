package com.mcm.mcmoments.auth.service;

import com.mcm.mcmoments.user.entity.User;
import com.mcm.mcmoments.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService
        extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        // Google 사용자 정보 가져오기
        OAuth2User oauth2User = super.loadUser(userRequest);

        String googleId = oauth2User.getAttribute("sub");
        String email = oauth2User.getAttribute("email");

        System.out.println("CustomOAuth2UserService 실행");
        System.out.println("googleId = " + googleId);
        System.out.println("email = " + email);

        // 기존 사용자가 없으면 저장
        userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    User newUser = User.create(
                            googleId,
                            email
                    );

                    return userRepository.save(newUser);
                });

        return oauth2User;
    }
}