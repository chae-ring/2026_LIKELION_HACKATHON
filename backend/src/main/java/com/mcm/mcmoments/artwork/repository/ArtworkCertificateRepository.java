package com.mcm.mcmoments.artwork.repository;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArtworkCertificateRepository extends JpaRepository<ArtworkCertificate, Long> {

    Optional<ArtworkCertificate> findByUserProductId(Long userProductId);
}
