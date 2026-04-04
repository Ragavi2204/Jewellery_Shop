package com.jewellery.controller;

import com.jewellery.dto.ApiResponse;
import com.jewellery.repository.LedgerRepository;
import com.jewellery.repository.ProductRepository;
import com.jewellery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DatabaseResetController {
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final LedgerRepository ledgerRepository;
    private final JdbcTemplate jdbcTemplate;

    @DeleteMapping("/reset-db")
    public ApiResponse<String> resetDatabase() {
        saleRepository.deleteAll();
        productRepository.deleteAll();
        ledgerRepository.deleteAll();
        return ApiResponse.success("Database reset successfully");
    }

    @GetMapping("/fix-db")
    public ApiResponse<String> fixDatabase() {
        try {
            jdbcTemplate.execute("ALTER TABLE products DROP INDEX uc_cat_sub_var");
            return ApiResponse.success("Database constraint dropped successfully");
        } catch (Exception e) {
            return ApiResponse.error("Error dropping constraint: " + e.getMessage());
        }
    }
}
