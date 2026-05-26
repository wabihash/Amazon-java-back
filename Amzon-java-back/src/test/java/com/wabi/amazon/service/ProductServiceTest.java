package com.wabi.amazon.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import com.google.cloud.firestore.WriteResult;
import com.wabi.amazon.model.Product;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private Firestore firestore;

    @InjectMocks
    private ProductService productService;

    @SuppressWarnings("unchecked")
    private static <T> ApiFuture<T> mockFuture() {
        return (ApiFuture<T>) mock(ApiFuture.class);
    }

    @Test
    void getByIdReturnsProductWhenDocumentExists() throws Exception {
        CollectionReference products = mock(CollectionReference.class);
        DocumentReference productRef = mock(DocumentReference.class);
        ApiFuture<DocumentSnapshot> future = mockFuture();
        DocumentSnapshot snapshot = mock(DocumentSnapshot.class);

        when(firestore.collection("products")).thenReturn(products);
        when(products.document("prod-1")).thenReturn(productRef);
        when(productRef.get()).thenReturn(future);
        when(future.get()).thenReturn(snapshot);
        when(snapshot.exists()).thenReturn(true);
        when(snapshot.getId()).thenReturn("prod-1");
        when(snapshot.getString("title")).thenReturn("Phone");
        when(snapshot.getString("description")).thenReturn("Great phone");
        when(snapshot.getString("image")).thenReturn("phone.png");
        when(snapshot.get("price")).thenReturn(1999L);
        when(snapshot.get("created")).thenReturn(Timestamp.ofTimeSecondsAndNanos(1700000000L, 0));

        Product product = productService.getById("prod-1").orElseThrow();

        assertEquals("prod-1", product.getId());
        assertEquals("Phone", product.getTitle());
        assertEquals(1999L, product.getPrice());
        assertTrue(product.getCreated() != null);
    }

    @Test
    void createAssignsIdAndCreatedInstant() throws Exception {
        CollectionReference products = mock(CollectionReference.class);
        DocumentReference productRef = mock(DocumentReference.class);
        ApiFuture<WriteResult> writeFuture = mockFuture();

        when(firestore.collection("products")).thenReturn(products);
        when(products.document(org.mockito.ArgumentMatchers.anyString())).thenReturn(productRef);
        when(productRef.set(org.mockito.ArgumentMatchers.anyMap(), org.mockito.ArgumentMatchers.any(SetOptions.class))).thenReturn(writeFuture);
        when(writeFuture.get()).thenReturn(null);

        Product created = productService.create(new Product(null, "Phone", "Great phone", "phone.png", 1999L, null));

        assertTrue(created.getId() != null && !created.getId().isBlank());
        assertTrue(created.getCreated() != null);
        assertEquals("Phone", created.getTitle());
    }
}
