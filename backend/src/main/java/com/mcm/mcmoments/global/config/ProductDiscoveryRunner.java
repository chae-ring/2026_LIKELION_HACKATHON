package com.mcm.mcmoments.global.config;

import com.mcm.mcmoments.product.service.ProductDiscoveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * 신상품 오프라인 발굴 파이프라인 실행기.
 *
 * 사용법: ./gradlew bootRun --args='--spring.profiles.active=local,discovery'
 * (local 프로필의 DB 설정 + discovery 프로필의 이 러너를 함께 활성화해야 한다)
 *
 * 절대 기본/운영 프로필에서 자동 실행되지 않는다. 관리자가 수동으로 트리거할 때만 동작하며,
 * 실행이 끝나면 애플리케이션이 자동으로 종료된다(일반 웹서버로 계속 떠있지 않음).
 */
@Slf4j
@Component
@Profile("discovery")
@RequiredArgsConstructor
public class ProductDiscoveryRunner implements CommandLineRunner {

    private final ProductDiscoveryService productDiscoveryService;
    private final ConfigurableApplicationContext context;

    @Override
    public void run(String... args) {
        log.info("[discovery] 신상품 오프라인 검증 파이프라인을 시작합니다.");
        productDiscoveryService.runDiscovery();
        log.info("[discovery] 파이프라인이 종료되었습니다. 애플리케이션을 종료합니다.");
        System.exit(SpringApplication.exit(context, () -> 0));
    }
}
