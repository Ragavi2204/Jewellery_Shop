package com.jewellery.repository;

import com.jewellery.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.subcategory = :subcategory AND p.variant = :variant AND p.detail = :detail")
    Optional<Product> findExactProduct(@Param("category") String category, @Param("subcategory") String subcategory, @Param("variant") String variant, @Param("detail") String detail);

    Optional<Product> findByCategoryAndSubcategoryAndVariant(String category, String subcategory, String variant);
}
