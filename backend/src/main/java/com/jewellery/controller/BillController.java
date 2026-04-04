package com.jewellery.controller;

import com.jewellery.dto.ApiResponse;
import com.jewellery.entity.Sale;
import com.jewellery.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bill")
@RequiredArgsConstructor
public class BillController {
    private final SaleService saleService;

    @GetMapping("/{saleId}")
    public ApiResponse<Map<String, Object>> getBill(@PathVariable Long saleId) {
        Sale sale = saleService.getSaleById(saleId);

        Map<String, Object> billData = new HashMap<>();
        billData.put("shop", "TAS Jewellers");
        billData.put("date", sale.getDate().toString());
        
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("name", sale.getVariant() + (sale.getDetail() != null ? " (" + sale.getDetail() + ")" : ""));
        item.put("weight", sale.getWeight());
        item.put("pricePerGram", sale.getPricePerGram());
        item.put("discount", sale.getDiscountPercent());
        item.put("total", sale.getTotal());
        items.add(item);
        
        billData.put("items", items);
        billData.put("total", sale.getTotal());

        return ApiResponse.success(billData);
    }
}
