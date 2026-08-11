package com.mcm.mcmoments.artwork.service;

import com.mcm.mcmoments.product.entity.UserProduct;
import com.mcm.mcmoments.story.entity.PurchaseStory;
import org.springframework.stereotype.Component;

@Component
public class ArtworkPromptFactory {

    public String create(UserProduct userProduct, PurchaseStory story) {
        return "Create a refined editorial artwork for a luxury "
                + userProduct.getProduct().getCategory()
                + " named " + userProduct.getProduct().getName()
                + ", in " + userProduct.getProduct().getColor()
                + ". Reflect this owner's memory: " + story.getContent();
    }
}
