package com.mcm.mcmoments.care.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "care_guide_items",
        indexes = {
                @Index(
                        name = "idx_care_guide_items_guide_order",
                        columnList = "care_guide_id, display_order"
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CareGuideItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "care_guide_id", nullable = false)
    private CareGuide careGuide;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    private CareGuideItem(
            CareGuide careGuide,
            String content,
            int displayOrder
    ) {
        this.careGuide = careGuide;
        this.content = content;
        this.displayOrder = displayOrder;
    }

    public static CareGuideItem create(
            CareGuide careGuide,
            String content,
            int displayOrder
    ) {
        return new CareGuideItem(
                careGuide,
                content,
                displayOrder
        );
    }
}