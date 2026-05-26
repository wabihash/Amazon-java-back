package com.wabi.amazon.controller;

import com.wabi.amazon.model.UserProfile;
import com.wabi.amazon.security.FirebaseAuthenticationFilter;
import com.wabi.amazon.service.UserProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.wabi.amazon.security.FirebaseAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@Import(AdminControllerTest.TestConfig.class)
public class AdminControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserProfileService userProfileService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        UserProfileService userProfileService() {
            return mock(UserProfileService.class);
        }
    }

    @Test
    void listUsersReturnsPaginatedResponse() throws Exception {
        when(userProfileService.listUsers(1, null)).thenReturn(Map.of(
            "users", List.of(new UserProfile("uid-1", "user@example.com", "Test", "user", Instant.now())),
            "nextPageToken", "uid-1"
        ));

        mvc.perform(get("/admin/users").param("limit", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.users[0].uid").value("uid-1"))
            .andExpect(jsonPath("$.nextPageToken").value("uid-1"));
    }

    @Test
    void setRoleUpdatesProfile() throws Exception {
        when(userProfileService.createOrUpdateProfile("uid-1", null, null, "admin"))
                .thenReturn(new UserProfile("uid-1", "user@example.com", "Test", "admin", Instant.now()));

        mvc.perform(put("/admin/users/uid-1/role").contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"admin\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("admin"));
    }
}
