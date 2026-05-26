package com.wabi.amazon.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@Lazy
public class CartService {

    private final Firestore firestore;

    public CartService(Firestore firestore) {
        this.firestore = firestore;
    }

    public Map<String,Object> getCart(String uid) throws Exception {
        String userId = Objects.requireNonNull(uid, "uid");
        DocumentSnapshot snap = firestore.collection("users").document(userId).collection("meta").document("cart").get().get();
        if (!snap.exists()) return Map.of("items", List.of());
        return snap.getData();
    }

    public Map<String,Object> saveCart(String uid, Map<String,Object> cart) throws Exception {
        String userId = Objects.requireNonNull(uid, "uid");
        DocumentReference ref = firestore.collection("users").document(userId).collection("meta").document("cart");
        Map<String, Object> safeCart = Objects.requireNonNull(cart, "cart");
        ref.set(safeCart, SetOptions.merge()).get();
        return safeCart;
    }

    public void clearCart(String uid) throws Exception {
        String userId = Objects.requireNonNull(uid, "uid");
        firestore.collection("users").document(userId).collection("meta").document("cart").delete().get();
    }
}
