package com.mcm.mcmoments.product.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UserProductCreateRequest {

    private String serialNumber;
    private LocalDate purchaseDate;
}