package com.wabi.amazon.controller;

import com.wabi.amazon.service.CartService;
import com.wabi.amazon.security.FirebaseAuthenticationFilter;
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

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CartController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.wabi.amazon.security.FirebaseAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@Import(CartControllerTest.TestConfig.class)
public class CartControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private CartService cartService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        CartService cartService() {
            return mock(CartService.class);
        }
    }

    @Test
    void getCartReturnsCart() throws Exception {
        when(cartService.getCart("uid-123")).thenReturn(Map.of("items", java.util.List.of()));

        mvc.perform(get("/cart").requestAttr("firebaseUid", "uid-123").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }
}
