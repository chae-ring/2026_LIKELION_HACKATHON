package com.mcm.mcmoments.product.service;

import com.mcm.mcmoments.artwork.entity.ArtworkCertificate;
import com.mcm.mcmoments.artwork.repository.ArtworkCertificateRepository;
import com.mcm.mcmoments.product.dto.SerialVerifyResponse;
import com.mcm.mcmoments.product.dto.UserProductCreateRequest;
import com.mcm.mcmoments.product.dto.UserProductCreateResponse;
import com.mcm.mcmoments.product.entity.ProductSerial;
import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.product.repository.ProductSerialRepository;
import com.mcm.mcmoments.product.repository.UserProductRepository;
import com.mcm.mcmoments.user.entity.User;
import com.mcm.mcmoments.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductSerialRepository productSerialRepository;
    private final UserProductRepository userProductRepository;
    private final UserRepository userRepository;
    private final ArtworkCertificateRepository artworkCertificateRepository;

    public SerialVerifyResponse verifySerial(String serialNumber) {

        ProductSerial serial = productSerialRepository
                .findBySerialNumber(serialNumber)
                .orElse(null);

        if (serial == null) {
            return SerialVerifyResponse.invalid();
        }

        if (!serial.isActive()) {
            return SerialVerifyResponse.invalid();
        }

        if (userProductRepository.existsBySerial_Id(serial.getId())) {
            return SerialVerifyResponse.invalid();
        }

        return SerialVerifyResponse.valid(
                serial.getProduct()
        );
    }

    @Transactional
    public UserProductCreateResponse registerProduct(
            Long userId,
            UserProductCreateRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

        ProductSerial serial = productSerialRepository
                .findBySerialNumber(request.getSerialNumber())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "유효하지 않은 시리얼 번호입니다."
                        )
                );

        if (!serial.isActive()) {
            throw new IllegalArgumentException(
                    "등록할 수 없는 시리얼 번호입니다."
            );
        }

        if (userProductRepository.existsBySerial_Id(serial.getId())) {
            throw new IllegalArgumentException(
                    "이미 등록된 시리얼 번호입니다."
            );
        }

        ArtworkCertificate artwork = artworkCertificateRepository
                .findById(request.getArtworkId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "아트워크를 찾을 수 없습니다."
                        )
                );

        // 시리얼의 상품과 아트워크의 상품이 같은지 확인
        if (!artwork.getProduct().getId()
                .equals(serial.getProduct().getId())) {
            throw new IllegalArgumentException(
                    "아트워크와 등록하려는 상품이 일치하지 않습니다."
            );
        }

        UserProduct userProduct = UserProduct.create(
                user,
                serial,
                request.getPurchaseDate()
        );

        userProductRepository.save(userProduct);

        // 최종 등록 시 아트워크와 UserProduct 연결
        artwork.assignUserProduct(userProduct);

        serial.deactivate();

        return UserProductCreateResponse.from(userProduct);
    }
}