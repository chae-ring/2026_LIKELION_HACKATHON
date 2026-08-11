package com.mcm.mcmoments.product.repository;

import com.mcm.mcmoments.product.entity.UserProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProductRepository extends JpaRepository<UserProduct, Long> {
}
