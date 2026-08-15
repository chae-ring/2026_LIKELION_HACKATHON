package com.mcm.mcmoments.product.repository;

import com.mcm.mcmoments.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByProductUrl(String productUrl);
    Optional<Product> findByName(String name);
    java.util.List<Product> findByRecommendableTrue();
}
