package com.wabi.amazon.controller;

import com.wabi.amazon.service.StripeService;
import com.wabi.amazon.security.FirebaseAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PaymentController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.wabi.amazon.security.FirebaseAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
public class PaymentControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private StripeService stripeService;

    @Test
    void createPaymentReturnsClientSecret() throws Exception {
        when(stripeService.createPaymentIntent(eq(1000L), eq("usd"), anyMap()))
                .thenReturn(Map.of("client_secret", "sk_test_123", "id", "pi_123"));

        mvc.perform(post("/payment/create")
                        .param("total", "1000")
                        .requestAttr("firebaseUid", "uid-1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.client_secret").value("sk_test_123"));
    }
}
