package com.wabi.amazon.controller;

import com.google.cloud.firestore.QuerySnapshot;
import com.wabi.amazon.security.FirebaseAuthenticationFilter;
import com.wabi.amazon.service.OrderService;
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

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.wabi.amazon.security.FirebaseAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@Import(OrderControllerTest.TestConfig.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private OrderService orderService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        OrderService orderService() {
            return mock(OrderService.class);
        }
    }

    @Test
    void listOrdersReturnsList() throws Exception {
        QuerySnapshot querySnapshot = mock(QuerySnapshot.class);
        when(querySnapshot.getDocuments()).thenReturn(java.util.List.of());
        when(orderService.listOrders("uid-1")).thenReturn(querySnapshot);

        mvc.perform(get("/orders").requestAttr("firebaseUid", "uid-1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
