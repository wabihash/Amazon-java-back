package com.wabi.amazon.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldPath;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.wabi.amazon.model.UserProfile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private Firestore firestore;

    @InjectMocks
    private UserProfileService userProfileService;

    @Test
    void getProfileReturnsUserWhenDocumentExists() throws Exception {
        CollectionReference users = mock(CollectionReference.class);
        DocumentReference userRef = mock(DocumentReference.class);
        ApiFuture<DocumentSnapshot> future = mock(ApiFuture.class);
        DocumentSnapshot snapshot = mock(DocumentSnapshot.class);

        when(firestore.collection("users")).thenReturn(users);
        when(users.document("uid-1")).thenReturn(userRef);
        when(userRef.get()).thenReturn(future);
        when(future.get()).thenReturn(snapshot);
        when(snapshot.exists()).thenReturn(true);
        when(snapshot.getString("email")).thenReturn("user@example.com");
        when(snapshot.getString("firstName")).thenReturn("User");
        when(snapshot.getString("role")).thenReturn("admin");
        when(snapshot.get("created")).thenReturn(Timestamp.ofTimeSecondsAndNanos(1700000000L, 0));

        var result = userProfileService.getProfile("uid-1");

        assertTrue(result.isPresent());
        UserProfile profile = result.get();
        assertEquals("uid-1", profile.getUid());
        assertEquals("user@example.com", profile.getEmail());
        assertEquals("User", profile.getFirstName());
        assertEquals("admin", profile.getRole());
        assertNotNull(profile.getCreated());
    }

    @Test
    void listUsersReturnsPageDataAndNextToken() throws Exception {
        CollectionReference users = mock(CollectionReference.class);
        Query query = mock(Query.class);
        ApiFuture<QuerySnapshot> future = mock(ApiFuture.class);
        QuerySnapshot querySnapshot = mock(QuerySnapshot.class);
        QueryDocumentSnapshot user1 = mock(QueryDocumentSnapshot.class);
        QueryDocumentSnapshot user2 = mock(QueryDocumentSnapshot.class);

        when(firestore.collection("users")).thenReturn(users);
        when(users.orderBy(FieldPath.documentId())).thenReturn(query);
        when(query.limit(2)).thenReturn(query);
        when(query.get()).thenReturn(future);
        when(future.get()).thenReturn(querySnapshot);
        when(querySnapshot.getDocuments()).thenReturn(List.of(user1, user2));

        when(user1.getId()).thenReturn("uid-1");
        when(user1.getString("email")).thenReturn("u1@example.com");
        when(user1.getString("firstName")).thenReturn("User1");
        when(user1.getString("role")).thenReturn("user");
        when(user1.get("created")).thenReturn(Timestamp.ofTimeSecondsAndNanos(1700000000L, 0));

        when(user2.getId()).thenReturn("uid-2");
        when(user2.getString("email")).thenReturn("u2@example.com");
        when(user2.getString("firstName")).thenReturn("User2");
        when(user2.getString("role")).thenReturn("admin");
        when(user2.get("created")).thenReturn(Timestamp.ofTimeSecondsAndNanos(1700000001L, 0));

        Map<String, Object> result = userProfileService.listUsers(2, null);

        List<UserProfile> usersResult = (List<UserProfile>) result.get("users");
        assertEquals(2, usersResult.size());
        assertEquals("uid-1", usersResult.get(0).getUid());
        assertEquals("uid-2", usersResult.get(1).getUid());
        assertEquals("uid-2", result.get("nextPageToken"));
    }

    @Test
    void listUsersWithoutFullPageHasNoNextToken() throws Exception {
        CollectionReference users = mock(CollectionReference.class);
        Query query = mock(Query.class);
        ApiFuture<QuerySnapshot> future = mock(ApiFuture.class);
        QuerySnapshot querySnapshot = mock(QuerySnapshot.class);
        QueryDocumentSnapshot user1 = mock(QueryDocumentSnapshot.class);

        when(firestore.collection("users")).thenReturn(users);
        when(users.orderBy(FieldPath.documentId())).thenReturn(query);
        when(query.limit(2)).thenReturn(query);
        when(query.startAfter("uid-0")).thenReturn(query);
        when(query.get()).thenReturn(future);
        when(future.get()).thenReturn(querySnapshot);
        when(querySnapshot.getDocuments()).thenReturn(List.of(user1));

        when(user1.getId()).thenReturn("uid-1");
        when(user1.getString("email")).thenReturn("u1@example.com");
        when(user1.getString("firstName")).thenReturn("User1");
        when(user1.getString("role")).thenReturn("user");

        Map<String, Object> result = userProfileService.listUsers(2, "uid-0");

        List<UserProfile> usersResult = (List<UserProfile>) result.get("users");
        assertEquals(1, usersResult.size());
        assertTrue(result.containsKey("nextPageToken"));
        assertNull(result.get("nextPageToken"));
    }
}
