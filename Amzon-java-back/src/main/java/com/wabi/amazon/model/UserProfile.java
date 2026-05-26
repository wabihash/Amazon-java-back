package com.wabi.amazon.model;

import java.time.Instant;

public class UserProfile {
    private String uid;
    private String email;
    private String firstName;
    private String role;
    private Instant created;

    public UserProfile() {
    }

    public UserProfile(String uid, String email, String firstName, String role, Instant created) {
        this.uid = uid;
        this.email = email;
        this.firstName = firstName;
        this.role = role;
        this.created = created;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getCreated() {
        return created;
    }

    public void setCreated(Instant created) {
        this.created = created;
    }
}
