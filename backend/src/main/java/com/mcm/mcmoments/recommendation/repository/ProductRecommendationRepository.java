package com.mcm.mcmoments.recommendation.repository;

import com.mcm.mcmoments.recommendation.entity.ProductRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRecommendationRepository extends JpaRepository<ProductRecommendation, Long> {

    @Query("SELECT pr FROM ProductRecommendation pr JOIN FETCH pr.recommendedProduct WHERE pr.baseProduct.id = :baseProductId ORDER BY pr.priority ASC")
    List<ProductRecommendation> findByBaseProductIdWithProduct(@Param("baseProductId") Long baseProductId);
}
