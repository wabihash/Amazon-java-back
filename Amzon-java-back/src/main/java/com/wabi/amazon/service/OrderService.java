package com.wabi.amazon.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Objects;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@Lazy
public class OrderService {

    private final Firestore firestore;

    public OrderService(Firestore firestore) {
        this.firestore = firestore;
    }

    @SuppressWarnings("null")
    public Map<String,Object> createOrder(String uid, Map<String,Object> orderData) throws Exception {
        String orderId = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Map<String,Object> data = new HashMap<>(Objects.requireNonNull(orderData, "orderData"));
        data.put("created", Timestamp.ofTimeSecondsAndNanos(now.getEpochSecond(), now.getNano()));
        String userId = Objects.requireNonNull(uid, "uid");
        String createdOrderId = Objects.requireNonNull(orderId, "orderId");
        DocumentReference ref = firestore.collection("users").document(userId).collection("orders").document(createdOrderId);
        ref.set(data).get();
        data.put("id", createdOrderId);
        return data;
    }

    public QuerySnapshot listOrders(String uid) throws Exception {
        String userId = Objects.requireNonNull(uid, "uid");
        return firestore.collection("users").document(userId).collection("orders").get().get();
    }

    public Map<String,Object> updateOrderStatus(String uid, String orderId, String status) throws Exception {
        String userId = Objects.requireNonNull(uid, "uid");
        String orderKey = Objects.requireNonNull(orderId, "orderId");
        String orderStatus = Objects.requireNonNull(status, "status");
        var ref = firestore.collection("users").document(userId).collection("orders").document(orderKey);
        Map<String, Object> statusUpdate = new HashMap<>();
        statusUpdate.put("status", orderStatus);
        ref.update(Objects.requireNonNull(statusUpdate, "statusUpdate")).get();
        var snap = ref.get().get();
        var data = snap.getData();
        if (data == null) data = new java.util.HashMap<>();
        data.put("id", snap.getId());
        return data;
    }
}
