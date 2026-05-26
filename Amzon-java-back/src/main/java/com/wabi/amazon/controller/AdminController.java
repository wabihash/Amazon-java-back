package com.wabi.amazon.controller;

import com.wabi.amazon.model.UserProfile;
import com.wabi.amazon.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserProfileService userProfileService;

    public AdminController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> listUsers(
            @RequestParam(name = "limit", defaultValue = "50") int limit,
            @RequestParam(name = "pageToken", required = false) String pageToken
    ) throws Exception {
        return ResponseEntity.ok(userProfileService.listUsers(limit, pageToken));
    }

    @PutMapping("/users/{uid}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfile> setRole(@PathVariable String uid, @RequestBody java.util.Map<String,String> body) throws Exception {
        String role = body.get("role");
        if (role == null) return ResponseEntity.badRequest().build();
        var profile = userProfileService.createOrUpdateProfile(uid, null, null, role);
        return ResponseEntity.ok(profile);
    }
}
