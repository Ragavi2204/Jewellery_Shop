package com.jewellery.service;

import com.jewellery.entity.Product;
import com.jewellery.entity.Sale;
import com.jewellery.repository.ProductRepository;
import com.jewellery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public Map<String, Object> getTodayReport() {
        List<Sale> todaySales = saleRepository.findByDate(LocalDate.now());
        List<Product> products = productRepository.findAll();

        long todaySalesCount = todaySales.size(); // Number of bills
        
        double todayTotalAmount = todaySales.stream()
                .mapToDouble(Sale::getTotal)
                .sum();

        double totalStockWeight = products.stream()
                .filter(p -> p.getWeight() != null)
                .mapToDouble(Product::getWeight)
                .sum();

        long totalItemsSold = todaySales.stream()
                .filter(s -> s.getQuantity() != null)
                .mapToLong(Sale::getQuantity)
                .sum();

        Map<String, Object> report = new HashMap<>();
        report.put("todaySalesCount", todaySalesCount);
        report.put("todayTotalAmount", todayTotalAmount);
        report.put("totalStockWeight", totalStockWeight);
        report.put("totalItemsSold", totalItemsSold);
        return report;
    }

    public List<Map<String, Object>> getCategorySummary() {
        List<Product> products = productRepository.findAll();
        Map<String, Map<String, Object>> summaryMap = new HashMap<>();

        for (Product p : products) {
            String category = p.getCategory();
            String subcategory = p.getSubcategory();
            
            if (category == null || category.isEmpty()) continue;
            
            String key = category;
            
            // DETERMINING GROUPING KEY:
            // If subcategory is a specific type (like 'கம்மல்', 'பாம்பே கொலுசு') 
            // and NOT a generic grouping key (like 'அளவு', 'வகைகள்'), use it as the main label.
            if (subcategory != null && !subcategory.trim().isEmpty() && 
                !subcategory.equals("அளவு") && 
                !subcategory.equals("வகைகள்") && 
                !subcategory.equals("பொருட்கள்")) {
                key = subcategory;
            } else if (category.contains("பொருட்கள்") || category.contains("வகைகள்") || category.equals("மற்றவை")) {
                if (subcategory != null && !subcategory.trim().isEmpty()) {
                    key = subcategory;
                }
            }

            // Normalize and remove prefixes/suffixes
            key = key.replace("வெள்ளி ", "")
                     .replace(" பொருட்கள்", "")
                     .replace(" வகைகள்", "")
                     .trim();

            if (key.isEmpty() || key.equals("பொருட்கள்") || key.equals("வகைகள்")) {
                key = category.replace("வெள்ளி ", "").replace(" பொருட்கள்", "").replace(" வகைகள்", "").trim();
            }

            // 4. Calculate totals
            int qty = (p.getQuantity() != null) ? p.getQuantity() : 0;
            double weight = (p.getWeight() != null) ? p.getWeight() : 0.0;
            
            // Aggregation
            summaryMap.putIfAbsent(key, new HashMap<>());
            Map<String, Object> entry = summaryMap.get(key);
            if (entry.isEmpty()) {
                entry.put("categoryName", key);
                entry.put("totalQuantity", 0);
                entry.put("totalWeight", 0.0);
            }
            entry.put("totalQuantity", (int)entry.get("totalQuantity") + qty);
            entry.put("totalWeight", (double)entry.get("totalWeight") + weight);
        }

        // 5. Final Filter: Remove items with zero stock
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> entry : summaryMap.values()) {
            int q = (int) entry.get("totalQuantity");
            double w = (double) entry.get("totalWeight");
            if (q > 0 || w > 0) {
                result.add(entry);
            }
        }
        return result;
    }

    public List<Sale> getSalesReport() {
        return saleRepository.findAll();
    }

    public List<Product> getStockReport() {
        return productRepository.findAll();
    }
}
