package com.mcm.mcmoments.global.config;

import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.ProductSerial;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.recommendation.entity.ProductRecommendation;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import com.mcm.mcmoments.user.entity.User;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class TestDataInitializer implements CommandLineRunner {

    private final EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        Long count = em.createQuery("select count(up) from UserProduct up", Long.class)
                .getSingleResult();

        if (count > 0) {
            return;
        }

        log.info("Initializing local test sample data (Products & Recommendations)...");

        // 1번 샘플 유저 & 제품 (Stark Backpack)
        User user1 = User.create("google-12345", "user1@gmail.com");
        em.persist(user1);

        Product product1 = Product.create(
                "Stark Backpack",
                "Visetos Monogram",
                "Cognac",
                "Backpack",
                "2025 S/S",
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1080",
                "https://example.com/products/1",
                24,
                true
        );
        em.persist(product1);

        ProductSerial serial1 = ProductSerial.create(product1, "MCM-DEMO-001");
        em.persist(serial1);

        UserProduct userProduct1 = UserProduct.create(user1, serial1, LocalDate.of(2026, 8, 1));
        em.persist(userProduct1);

        PurchaseStory story1 = PurchaseStory.create(
                userProduct1,
                "첫 취업 후 받은 첫 월급으로 나에게 선물한 가방입니다. 자부심과 기쁨이 가득합니다."
        );
        em.persist(story1);


        // 2번 샘플 유저 & 제품 (Klara Crossbody Bag)
        User user2 = User.create("google-67890", "user2@gmail.com");
        em.persist(user2);

        Product product2 = Product.create(
                "Klara Crossbody",
                "Visetos Monogram",
                "Deep Cognac & Gold",
                "Crossbody Bag",
                "2025 S/S",
                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1080",
                "https://example.com/products/2",
                24,
                true
        );
        em.persist(product2);

        ProductSerial serial2 = ProductSerial.create(product2, "MCM-DEMO-002");
        em.persist(serial2);

        UserProduct userProduct2 = UserProduct.create(user2, serial2, LocalDate.of(2026, 8, 5));
        em.persist(userProduct2);

        PurchaseStory story2 = PurchaseStory.create(
                userProduct2,
                "이직 후 고생한 나 자신에게 바치는 선물. 힘든 시간 끝에 찾아온 자부심과 새로운 시작에 대한 설렘이 담겨 있습니다."
        );
        em.persist(story2);

        // --- 아래부터는 아무도 보유하지 않은, AI 추천 후보 전용 상품들이다(is_recommendable=true). ---
        // 카테고리/컬러/시즌을 다양하게 갖춰야 AI가 "컬렉션 다양성"을 근거로 그럴듯한 추천을 만들 수 있다.
        // (실시간 웹 검색을 요청 경로에서 뺀 뒤로는, 이 시드 데이터가 추천 품질의 유일한 재료다.)

        // 3번 - Aren Backpack Small (Backpack)
        Product product3 = Product.create(
                "Aren Backpack Small",
                "Visetos Monogram",
                "Black",
                "Backpack",
                "2025 S/S",
                "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1080",
                "https://example.com/products/3",
                24,
                true
        );
        em.persist(product3);

        // 4번 - Aren Tote Bag (Tote Bag)
        Product product4 = Product.create(
                "Aren Tote Bag",
                "Visetos Monogram",
                "Cognac Visetos",
                "Tote Bag",
                "2025 S/S",
                "https://images.unsplash.com/photo-1567744875520-cf9c27fbb53b?w=1080",
                "https://example.com/products/4",
                24,
                true
        );
        em.persist(product4);

        // 5번 - Soft Berlin Shoulder Bag (Shoulder Bag)
        Product product5 = Product.create(
                "Soft Berlin Shoulder Bag",
                "Soft Berlin",
                "Black",
                "Shoulder Bag",
                "2025 F/W",
                "https://images.unsplash.com/photo-1623783356340-95375aac85ce?w=1080",
                "https://example.com/products/5",
                24,
                true
        );
        em.persist(product5);

        // 6번 - Zip Around Wallet (Wallet, 소품군 - 카테고리 다양성용)
        Product product6 = Product.create(
                "Zip Around Wallet",
                "Visetos Monogram",
                "Cognac",
                "Wallet",
                "2025 S/S",
                "https://images.unsplash.com/photo-1614330315994-efd5ea8163a1?w=1080",
                "https://example.com/products/6",
                12,
                true
        );
        em.persist(product6);

        // 7번 - Stark Belt Bag (Belt Bag)
        Product product7 = Product.create(
                "Stark Belt Bag",
                "Visetos Monogram",
                "Black",
                "Belt Bag",
                "2026 S/S",
                "https://images.unsplash.com/photo-1507831041068-539748fc3c3b?w=1080",
                "https://example.com/products/7",
                24,
                true
        );
        em.persist(product7);

        // 8번 - Diamond Visetos Crossbody (Crossbody Bag, 다른 패턴)
        Product product8 = Product.create(
                "Diamond Visetos Crossbody",
                "Diamond Visetos",
                "Black",
                "Crossbody Bag",
                "2026 S/S",
                "https://images.unsplash.com/photo-1569484221992-2a453658fff3?w=1080",
                "https://example.com/products/8",
                24,
                true
        );
        em.persist(product8);

        // AI 추천이 실패했을 때를 위한 큐레이션 추천 페어 (product_recommendations)
        // - product1(Stark Backpack) 보유자: 새로운 실루엣(벨트백 → 토트) 우선, 그 다음 크로스바디
        // - product2(Klara Crossbody) 보유자: 백팩 → 숄더백 → 지갑 순으로 컬렉션을 넓혀가는 추천
        em.persist(ProductRecommendation.create(product1, product7, 1));
        em.persist(ProductRecommendation.create(product1, product4, 2));
        em.persist(ProductRecommendation.create(product1, product2, 3));

        em.persist(ProductRecommendation.create(product2, product3, 1));
        em.persist(ProductRecommendation.create(product2, product5, 2));
        em.persist(ProductRecommendation.create(product2, product6, 3));

        log.info("Successfully initialized local test sample data (Users, Collection, Recommendation candidates)!");
    }
}
