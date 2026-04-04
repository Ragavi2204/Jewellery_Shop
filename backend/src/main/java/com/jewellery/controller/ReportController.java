package com.jewellery.controller;

import com.jewellery.dto.ApiResponse;
import com.jewellery.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/today")
    public ApiResponse<Map<String, Object>> getTodayReport() {
        return ApiResponse.success(reportService.getTodayReport());
    }

    @GetMapping("/sales")
    public ApiResponse<Object> getSalesReport() {
        return ApiResponse.success(reportService.getSalesReport());
    }

    @GetMapping("/stock")
    public ApiResponse<Object> getStockReport() {
        return ApiResponse.success(reportService.getStockReport());
    }

    @GetMapping("/category-summary")
    public ApiResponse<Object> getCategorySummary() {
        return ApiResponse.success(reportService.getCategorySummary());
    }
}
