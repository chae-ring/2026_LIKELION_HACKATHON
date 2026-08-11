package com.mcm.mcmoments.product.controller;

import com.mcm.mcmoments.product.dto.SerialVerifyRequest;
import com.mcm.mcmoments.product.dto.SerialVerifyResponse;
import com.mcm.mcmoments.product.dto.UserProductCreateRequest;
import com.mcm.mcmoments.product.dto.UserProductCreateResponse;
import com.mcm.mcmoments.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ProductController {

    private final ProductService productService;

    @PostMapping("/products/serial/verify")
    public ResponseEntity<SerialVerifyResponse> verifySerial(
            @RequestBody SerialVerifyRequest request
    ) {

        SerialVerifyResponse response =
                productService.verifySerial(
                        request.getSerialNumber()
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/user-products")
    public ResponseEntity<UserProductCreateResponse> registerProduct(
            Authentication authentication,
            @RequestBody UserProductCreateRequest request
    ) {

        Long userId = (Long) authentication.getPrincipal();

        UserProductCreateResponse response =
                productService.registerProduct(
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }
}