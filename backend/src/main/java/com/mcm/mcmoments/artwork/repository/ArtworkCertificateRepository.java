package com.mcm.mcmoments.artwork.repository;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtworkCertificateRepository
        extends JpaRepository<ArtworkCertificate, Long> {
}