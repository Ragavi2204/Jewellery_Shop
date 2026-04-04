package com.jewellery.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_subcategory", columnList = "subcategory"),
    @Index(name = "idx_variant", columnList = "variant")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String subcategory;

    @Column(nullable = false)
    private String variant;

    @Column(nullable = false)
    private String detail;

    @Column(nullable = false, columnDefinition = "int default 0")
    private Integer quantity = 0;

    @Column(nullable = false)
    private Double weight; // grams

    @CreationTimestamp
    private LocalDateTime createdAt;
}
