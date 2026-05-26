package com.wabi.amazon.controller;

import java.util.Map;

import com.wabi.amazon.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String,Object>> getCart(@RequestAttribute("firebaseUid") String uid) throws Exception {
        return ResponseEntity.ok(cartService.getCart(uid));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String,Object>> saveCart(@RequestAttribute("firebaseUid") String uid, @RequestBody Map<String,Object> cart) throws Exception {
        return ResponseEntity.ok(cartService.saveCart(uid, cart));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> clearCart(@RequestAttribute("firebaseUid") String uid) throws Exception {
        cartService.clearCart(uid);
        return ResponseEntity.noContent().build();
    }
}
