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


        // 3번 & 4번 추천 전용 상품 데이터
        Product product3 = Product.create(
                "Aren Backpack Small",
                "Visetos Monogram",
                "Cognac",
                "Backpack",
                "2025 S/S",
                "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1080",
                "https://example.com/products/3",
                24,
                true
        );
        em.persist(product3);

        Product product4 = Product.create(
                "Klara Monogram Tote",
                "Visetos Monogram",
                "Black",
                "Tote Bag",
                "2025 F/W",
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1080",
                "https://example.com/products/4",
                24,
                true
        );
        em.persist(product4);


        // 추천 상품 매핑 (Product 1 -> Product 3, Product 2)
        ProductRecommendation rec1 = ProductRecommendation.create(product1, product3, 1);
        em.persist(rec1);

        ProductRecommendation rec2 = ProductRecommendation.create(product1, product2, 2);
        em.persist(rec2);

        // 추천 상품 매핑 (Product 2 -> Product 4)
        ProductRecommendation rec3 = ProductRecommendation.create(product2, product4, 1);
        em.persist(rec3);

        log.info("Successfully initialized local test sample data with recommendations! UserProduct ID 1 & 2 ready.");
    }
}
