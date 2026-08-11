package com.mcm.mcmoments.product.repository;

import com.mcm.mcmoments.product.entity.ProductSerial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductSerialRepository
        extends JpaRepository<ProductSerial, Long> {

    Optional<ProductSerial> findBySerialNumber(String serialNumber);
}