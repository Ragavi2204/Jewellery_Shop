package com.jewellery.service;

import com.jewellery.entity.Product;
import com.jewellery.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product addOrUpdateStock(Product product) {
        if (product.getDetail() == null) {
            product.setDetail("");
        }
        if (product.getQuantity() == null) {
            product.setQuantity(0);
        }

        // ALWAYS adding NEW stock entry per user request (no merging)
        log.info("Adding NEW stock entry for: {} - {} - {} - {}", product.getCategory(), product.getSubcategory(), product.getVariant(), product.getDetail());
        return productRepository.save(product);
    }

    public Optional<Product> getProduct(Long id) {
        return productRepository.findById(id);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setCategory(productDetails.getCategory());
        product.setSubcategory(productDetails.getSubcategory());
        product.setVariant(productDetails.getVariant());
        product.setWeight(productDetails.getWeight());
        product.setQuantity(productDetails.getQuantity() != null ? productDetails.getQuantity() : 0);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Optional<Product> findProduct(String category, String subcategory, String variant) {
        return productRepository.findByCategoryAndSubcategoryAndVariant(category, subcategory, variant);
    }
}
