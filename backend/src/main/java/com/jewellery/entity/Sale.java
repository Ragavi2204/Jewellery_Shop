package com.jewellery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String subcategory;

    @Column(nullable = false)
    private String variant;

    @Column(nullable = false)
    private String detail;

    @Column(nullable = false)
    private Double weight; // grams sold

    @Column(nullable = false)
    private Integer quantity; // pieces sold

    @Column(nullable = false, columnDefinition = "Double default 0.0")
    private Double pricePerGram;

    private Double discountPercent;
    private Double discountAmount;
    private String discountType; // "PERCENT" or "FIXED"

    private Double gstPercent;
    private String gstType; // "PERCENT" or "FIXED"
    
    @Column(nullable = false)
    private Double subtotal; // Weight * Rate

    @Column(nullable = false)
    private Double gstAmount; 

    @Column(nullable = false)
    private Double total; // Grand Total (subtotal - discount + GST)

    @Column(nullable = false)
    private Double price; // Duplicate of total for DB compatibility

    private String customerName;

    @Column(nullable = false)
    private LocalDate date;
}
