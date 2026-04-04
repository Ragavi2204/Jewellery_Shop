package com.jewellery.controller;

import com.jewellery.dto.ApiResponse;
import com.jewellery.entity.Product;
import com.jewellery.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @PostMapping
    public ApiResponse<Product> addStock(@RequestBody Product product) {
        return ApiResponse.success(productService.addOrUpdateStock(product));
    }

    @GetMapping
    public ApiResponse<List<Product>> getAllProducts() {
        return ApiResponse.success(productService.getAllProducts());
    }

    @GetMapping("/filter")
    public ApiResponse<List<Product>> filterProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String variant) {
        
        List<Product> products = productService.getAllProducts().stream()
                .filter(p -> (category == null || p.getCategory().equals(category)))
                .filter(p -> (subcategory == null || p.getSubcategory().equals(subcategory)))
                .filter(p -> (variant == null || p.getVariant().equals(variant)))
                .collect(Collectors.toList());
        
        return ApiResponse.success(products);
    }

    @PutMapping("/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ApiResponse.success(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.success("Product deleted");
    }
}
