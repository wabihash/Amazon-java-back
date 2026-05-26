package com.wabi.amazon.controller;

import java.io.BufferedReader;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.wabi.amazon.service.StripeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins = "http://localhost:5175")
public class PaymentController {

    private final StripeService stripeService;

    public PaymentController(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/payment/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String,Object>> createPayment(@RequestParam("total") long total,
                                                           @RequestAttribute("firebaseUid") String uid,
                                                           @RequestBody(required = false) Map<String,Object> body) throws Exception {
        Map<String,String> metadata = new HashMap<>();
        metadata.put("uid", uid);
        if (body != null && body.containsKey("basketJson")) {
            metadata.put("basket", String.valueOf(body.get("basketJson")));
        }
        return ResponseEntity.ok(stripeService.createPaymentIntent(total, "usd", metadata));
    }

    @PostMapping(path = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleWebhook(HttpServletRequest request, @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            String payload = sb.toString();
            Event event = stripeService.constructEvent(payload, sigHeader);
            stripeService.handleEvent(event);
            return ResponseEntity.ok("received");
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook: " + e.getMessage());
        }
    }
}
