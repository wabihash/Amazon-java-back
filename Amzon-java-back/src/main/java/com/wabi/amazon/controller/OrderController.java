package com.wabi.amazon.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.wabi.amazon.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String,Object>>> list(@RequestAttribute("firebaseUid") String uid) throws Exception {
        var snap = orderService.listOrders(uid);
        List<Map<String,Object>> out = new ArrayList<>();
        for (QueryDocumentSnapshot d : snap.getDocuments()) {
            Map<String,Object> m = d.getData();
            m.put("id", d.getId());
            out.add(m);
        }
        return ResponseEntity.ok(out);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String,Object>> create(@RequestAttribute("firebaseUid") String uid, @RequestBody Map<String,Object> order) throws Exception {
        return ResponseEntity.ok(orderService.createOrder(uid, order));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String,Object>> updateStatus(@PathVariable String id, @RequestBody Map<String,String> body) throws Exception {
        String uid = body.get("uid");
        String status = body.get("status");
        if (uid == null || status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.updateOrderStatus(uid, id, status));
    }
}
