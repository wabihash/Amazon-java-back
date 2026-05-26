package com.wabi.amazon.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.Objects;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.SetOptions;
import com.wabi.amazon.model.Product;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@Lazy
public class ProductService {

    private final Firestore firestore;

    public ProductService(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Product> listAll() throws Exception {
        QuerySnapshot snap = firestore.collection("products").get().get();
        List<Product> result = new ArrayList<>();
        for (QueryDocumentSnapshot doc : snap.getDocuments()) {
            Product p = fromDoc(doc);
            p.setId(doc.getId());
            result.add(p);
        }
        return result;
    }

    public Optional<Product> getById(String id) throws Exception {
        String productId = Objects.requireNonNull(id, "id");
        DocumentSnapshot doc = firestore.collection("products").document(productId).get().get();
        if (!doc.exists()) return Optional.empty();
        Product p = fromDoc(doc);
        p.setId(doc.getId());
        return Optional.of(p);
    }

    public Product create(Product p) throws Exception {
        String id = UUID.randomUUID().toString();
        p.setId(id);
        Instant now = Instant.now();
        p.setCreated(now);
        DocumentReference ref = firestore.collection("products").document(Objects.requireNonNull(id, "id"));
        ref.set(Objects.requireNonNull(p.toMap(), "product data"), SetOptions.merge()).get();
        return p;
    }

    public Product update(String id, Map<String,Object> updates) throws Exception {
        String productId = Objects.requireNonNull(id, "id");
        DocumentReference ref = firestore.collection("products").document(productId);
        ref.set(Objects.requireNonNull(updates, "updates"), SetOptions.merge()).get();
        return getById(productId).orElseThrow(() -> new IllegalStateException("Product not found after update"));
    }

    public void delete(String id) throws Exception {
        String productId = Objects.requireNonNull(id, "id");
        firestore.collection("products").document(productId).delete().get();
    }

    private Product fromDoc(DocumentSnapshot doc) {
        Product p = new Product();
        p.setTitle(doc.getString("title"));
        p.setDescription(doc.getString("description"));
        p.setImage(doc.getString("image"));
        Object priceObj = doc.get("price");
        if (priceObj instanceof Number n) p.setPrice(n.longValue());
        Object created = doc.get("created");
        if (created instanceof Timestamp ts) p.setCreated(ts.toDate().toInstant());
        return p;
    }
}
