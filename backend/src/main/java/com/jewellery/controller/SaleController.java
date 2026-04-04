package com.jewellery.controller;

import com.jewellery.dto.ApiResponse;
import com.jewellery.entity.Sale;
import com.jewellery.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {
    private final SaleService saleService;

    @PostMapping
    public ApiResponse<Sale> createSale(@RequestBody Sale sale) {
        return ApiResponse.success(saleService.processSale(sale));
    }

    @GetMapping
    public ApiResponse<List<Sale>> getAllSales() {
        return ApiResponse.success(saleService.getAllSales());
    }

    @GetMapping("/today")
    public ApiResponse<List<Sale>> getTodaySales() {
        return ApiResponse.success(saleService.getTodaySales());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteSale(@PathVariable Long id) {
        saleService.deleteSaleAndRestoreStock(id);
        return ApiResponse.success("Sale deleted");
    }
}
