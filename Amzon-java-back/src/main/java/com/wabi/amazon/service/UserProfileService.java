package com.wabi.amazon.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldPath;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import com.wabi.amazon.model.UserProfile;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@Lazy
public class UserProfileService {

    private final Firestore firestore;

    public UserProfileService(Firestore firestore) {
        this.firestore = firestore;
    }

    public Optional<UserProfile> getProfile(String uid) throws Exception {
        DocumentSnapshot snapshot = firestore.collection("users").document(uid).get().get();
        if (!snapshot.exists()) {
            return Optional.empty();
        }

        UserProfile profile = new UserProfile();
        profile.setUid(uid);
        profile.setEmail(snapshot.getString("email"));
        profile.setFirstName(snapshot.getString("firstName"));
        profile.setRole(snapshot.getString("role") == null ? "user" : snapshot.getString("role"));

        Object createdValue = snapshot.get("created");
        if (createdValue instanceof Timestamp timestamp) {
            profile.setCreated(timestamp.toDate().toInstant());
        } else if (createdValue instanceof Instant instant) {
            profile.setCreated(instant);
        } else if (createdValue instanceof String createdString && !createdString.isBlank()) {
            profile.setCreated(Instant.parse(createdString));
        }

        return Optional.of(profile);
    }

    public UserProfile createOrUpdateProfile(String uid, String email, String firstName, String role) throws Exception {
        Instant createdAt = Instant.now();
        Map<String, Object> data = new HashMap<>();
        data.put("email", email);
        data.put("firstName", firstName);
        data.put("role", role == null ? "user" : role);
        data.put("created", Timestamp.ofTimeSecondsAndNanos(createdAt.getEpochSecond(), createdAt.getNano()));

        DocumentReference ref = firestore.collection("users").document(uid);
        ref.set(data, SetOptions.merge()).get();

        return new UserProfile(uid, email, firstName, role == null ? "user" : role, createdAt);
    }

    public java.util.Map<String,Object> listUsers(int limit, String startAfterUid) throws Exception {
        int pageSize = limit <= 0 ? 50 : limit;
        Query q = firestore.collection("users").orderBy(FieldPath.documentId());
        if (startAfterUid != null && !startAfterUid.isBlank()) {
            q = q.startAfter(startAfterUid);
        }
        QuerySnapshot snap = q.limit(pageSize).get().get();
        List<UserProfile> out = new ArrayList<>();
        String nextPageToken = null;
        for (QueryDocumentSnapshot d : snap.getDocuments()) {
            UserProfile p = new UserProfile();
            p.setUid(d.getId());
            p.setEmail(d.getString("email"));
            p.setFirstName(d.getString("firstName"));
            p.setRole(d.getString("role") == null ? "user" : d.getString("role"));
            Object createdValue = d.get("created");
            if (createdValue instanceof Timestamp timestamp) {
                p.setCreated(timestamp.toDate().toInstant());
            }
            out.add(p);
        }
        if (!out.isEmpty() && out.size() == pageSize) {
            nextPageToken = out.get(out.size() - 1).getUid();
        }
        Map<String, Object> response = new HashMap<>();
        response.put("users", out);
        response.put("count", out.size());
        response.put("nextPageToken", nextPageToken);
        return response;
    }
}
