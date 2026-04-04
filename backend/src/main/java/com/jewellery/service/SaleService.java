package com.jewellery.service;

import com.jewellery.entity.Ledger;
import com.jewellery.entity.Product;
import com.jewellery.entity.Sale;
import com.jewellery.exception.InsufficientStockException;
import com.jewellery.exception.ProductNotFoundException;
import com.jewellery.repository.LedgerRepository;
import com.jewellery.repository.ProductRepository;
import com.jewellery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SaleService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final LedgerRepository ledgerRepository;

    @Transactional
    public Sale processSale(Sale saleRequest) {
        log.info("Processing sale for ProductID: {}", saleRequest.getProductId());

        // 1. Find exact product by ID, fallback to attribute match for UNDO support
        Product product = productRepository.findById(saleRequest.getProductId())
                .orElseGet(() -> {
                    return productRepository.findAll().stream()
                        .filter(p -> p.getCategory().equals(saleRequest.getCategory())
                                && p.getVariant().equals(saleRequest.getVariant())
                                && java.util.Objects.equals(p.getDetail(), saleRequest.getDetail()))
                        .findFirst()
                        .orElseThrow(() -> new ProductNotFoundException("❌ பொருள் இல்லை (Product Not Found)"));
                });

        // 2. Validate input values
        if ((saleRequest.getWeight() == null || saleRequest.getWeight() <= 0) && (saleRequest.getQuantity() == null || saleRequest.getQuantity() <= 0)) {
            throw new RuntimeException("❌ எடை (Weight) அல்லது எண்ணிக்கை (Qty) தேவை");
        }
        if (saleRequest.getPricePerGram() == null || saleRequest.getPricePerGram() <= 0) {
            throw new RuntimeException("❌ விலை/g கொடுக்க வேண்டும்");
        }

        // 3. Validate stock
        if (saleRequest.getWeight() != null && product.getWeight() < saleRequest.getWeight()) {
            throw new InsufficientStockException("❌ இருப்பில் போதுமான எடை இல்லை");
        }
        if (saleRequest.getQuantity() != null && product.getQuantity() != null && product.getQuantity() < saleRequest.getQuantity()) {
            throw new InsufficientStockException("❌ இருப்பில் போதுமான எண்ணிக்கை இல்லை");
        }

        // 4. Reduce stock from THIS specific ID
        if (saleRequest.getWeight() != null) {
            product.setWeight(product.getWeight() - saleRequest.getWeight());
        }
        if (saleRequest.getQuantity() != null && product.getQuantity() != null) {
            product.setQuantity(product.getQuantity() - saleRequest.getQuantity());
        }
        
        // If stock becomes zero (or near zero), delete it from inventory list.
        boolean weightDepleted = product.getWeight() != null && product.getWeight() <= 0.001;
        boolean qtyDepleted = product.getQuantity() != null && product.getQuantity() <= 0;

        if (weightDepleted || qtyDepleted) {
            productRepository.delete(product);
        } else {
            productRepository.save(product);
        }

        // 5. Use pre-calculated values from frontend if possible, otherwise calculate
        double weight = (saleRequest.getWeight() != null) ? saleRequest.getWeight() : 0.0;
        double quantity = (saleRequest.getQuantity() != null) ? (double)saleRequest.getQuantity() : 0.0;
        double rate = (saleRequest.getPricePerGram() != null) ? saleRequest.getPricePerGram() : 0.0;
        
        // Use provided subtotal or calculate it
        double subtotal = (saleRequest.getSubtotal() != null && saleRequest.getSubtotal() > 0) 
                ? saleRequest.getSubtotal() 
                : (weight > 0 ? weight * rate : quantity * rate);

        // --- DISCOUNT CALCULATION ---
        double discAmt = 0.0;
        String dType = (saleRequest.getDiscountType() != null) ? saleRequest.getDiscountType() : "PERCENT";
        
        if ("FIXED".equalsIgnoreCase(dType)) {
            discAmt = (saleRequest.getDiscountAmount() != null) ? saleRequest.getDiscountAmount() : 0.0;
        } else {
            // PERCENT
            double dPercent = (saleRequest.getDiscountPercent() != null) ? saleRequest.getDiscountPercent() : 0.0;
            discAmt = subtotal * (dPercent / 100.0);
        }
        
        double subAfterDiscount = Math.max(0, subtotal - discAmt);
        
        // --- GST CALCULATION ---
        double gstAmt = 0.0;
        String gType = (saleRequest.getGstType() != null) ? saleRequest.getGstType() : "PERCENT";
        
        if ("FIXED".equalsIgnoreCase(gType)) {
            gstAmt = (saleRequest.getGstAmount() != null) ? saleRequest.getGstAmount() : 0.0;
        } else {
            // PERCENT
            double gPercent = (saleRequest.getGstPercent() != null) ? saleRequest.getGstPercent() : 3.0; // Default 3%
            gstAmt = subAfterDiscount * (gPercent / 100.0);
        }
        
        // User's Rule: Final Total = (Subtotal - Discount) + GST
        double finalTotal = subAfterDiscount + gstAmt;

        saleRequest.setSubtotal(subtotal);
        saleRequest.setDiscountAmount(discAmt);
        saleRequest.setGstAmount(gstAmt);
        saleRequest.setTotal(finalTotal);
        saleRequest.setPrice(finalTotal); 
        
        // Copy product details to sale for record keeping
        saleRequest.setCategory(product.getCategory());
        saleRequest.setSubcategory(product.getSubcategory());
        saleRequest.setVariant(product.getVariant());
        saleRequest.setDetail(product.getDetail());
        saleRequest.setProductId(product.getId());
        saleRequest.setDate(LocalDate.now());
        
        Sale savedSale = saleRepository.save(saleRequest);

        // 6. Save ledger
        Ledger ledger = Ledger.builder()
                .type("SALE")
                .amount(savedSale.getTotal())
                .date(LocalDate.now())
                .build();
        ledgerRepository.save(ledger);

        log.info("Sale processed successfully. SaleID: {}", savedSale.getId());
        return savedSale;
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public List<Sale> getTodaySales() {
        return saleRepository.findByDate(LocalDate.now());
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id).orElseThrow(() -> new RuntimeException("Sale not found"));
    }

    @Transactional
    public void deleteSaleAndRestoreStock(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));
                
        // Try to find the exact product
        java.util.Optional<Product> prodOpt = productRepository.findById(sale.getProductId());
        
        if (prodOpt.isPresent()) {
            Product p = prodOpt.get();
            p.setQuantity(p.getQuantity() + sale.getQuantity());
            p.setWeight(p.getWeight() + sale.getWeight());
            productRepository.save(p);
        } else {
            // Recreate the missing product
            Product newStock = Product.builder()
                .category(sale.getCategory())
                .subcategory(sale.getSubcategory())
                .variant(sale.getVariant())
                .detail(sale.getDetail())
                .weight(sale.getWeight())
                .quantity(sale.getQuantity())
                .build();
            productRepository.save(newStock);
        }
        
        // Remove ledger entry for this sale amount
        List<Ledger> ledgers = ledgerRepository.findAll();
        for (Ledger l : ledgers) {
            if ("SALE".equals(l.getType()) && l.getAmount().equals(sale.getTotal()) && l.getDate().equals(sale.getDate())) {
                ledgerRepository.delete(l);
                break; // Just delete the first matching ledger
            }
        }
        
        saleRepository.delete(sale);
    }
}
