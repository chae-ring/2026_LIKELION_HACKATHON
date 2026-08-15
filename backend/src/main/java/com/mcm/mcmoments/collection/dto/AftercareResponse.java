package com.mcm.mcmoments.collection.dto;

import com.mcm.mcmoments.care.entity.CareGuideItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

/**
 * COL-003 애프터케어 조회 결과를 보증 정보와 관리 팁 형태로 반환하는 DTO입니다.
 */
@Getter
@AllArgsConstructor
public class AftercareResponse {

    private Warranty warranty;
    private List<CareTip> careTips;

    public static AftercareResponse from(
            Warranty warranty,
            List<CareGuideItem> careGuideItems
    ) {
        List<CareTip> careTips = careGuideItems.stream()
                .map(CareTip::from)
                .toList();

        return new AftercareResponse(warranty, careTips);
    }

    /**
     * 보증 상태는 enum 이름 그대로 ACTIVE, EXPIRING, EXPIRED, UNKNOWN 문자열로 응답됩니다.
     */
    @Getter
    @AllArgsConstructor
    public static class Warranty {

        private WarrantyStatus status;
        private LocalDate purchaseDate;
        private LocalDate expiresAt;
        private Integer monthsLeft;
    }

    public enum WarrantyStatus {
        ACTIVE,
        EXPIRING,
        EXPIRED,
        UNKNOWN
    }

    /**
     * Entity의 displayOrder를 API 명세의 order 필드로 변환합니다.
     */
    @Getter
    @AllArgsConstructor
    public static class CareTip {

        private int order;
        private String content;

        private static CareTip from(CareGuideItem item) {
            return new CareTip(
                    item.getDisplayOrder(),
                    item.getContent()
            );
        }
    }
}
