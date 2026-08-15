package com.mcm.mcmoments.product.repository;

import com.mcm.mcmoments.product.entity.UserProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProductRepository extends JpaRepository<UserProduct, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT up FROM UserProduct up JOIN FETCH up.serial s JOIN FETCH s.product p WHERE up.user.id = :userId")
    java.util.List<UserProduct> findByUserIdWithProduct(@org.springframework.data.repository.query.Param("userId") Long userId);

    boolean existsBySerial_Id(Long serialId);
}
