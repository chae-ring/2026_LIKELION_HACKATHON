package com.mcm.mcmoments.global.config;

import com.mcm.mcmoments.product.entity.Product;
import com.mcm.mcmoments.product.entity.ProductSerial;
import com.mcm.mcmoments.product.entity.UserProduct;
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

        log.info("Initializing local test sample data using EntityManager...");

        User user = User.create("google-12345", "user@gmail.com");
        em.persist(user);

        Product product = Product.create(
                "Stark Backpack",
                "Visetos",
                "Cognac",
                "Backpack",
                "2025 S/S",
                "https://example.com/stark-backpack.png",
                "https://example.com/products/1",
                24,
                true
        );
        em.persist(product);

        ProductSerial serial = ProductSerial.create(product, "MCM-DEMO-001");
        em.persist(serial);

        UserProduct userProduct = UserProduct.create(user, serial, LocalDate.of(2026, 8, 1));
        em.persist(userProduct);

        PurchaseStory story = PurchaseStory.create(
                userProduct,
                "첫 취업 후 받은 첫 월급으로 나에게 선물한 가방입니다."
        );
        em.persist(story);

        log.info("Successfully initialized local test sample data! UserProduct ID: {}", userProduct.getId());
    }
}
