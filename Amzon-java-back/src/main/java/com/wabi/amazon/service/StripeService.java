package com.wabi.amazon.service;

import java.util.HashMap;
import java.util.Map;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Service;

@Service
public class StripeService implements InitializingBean {

    private final OrderService orderService;

    public StripeService(OrderService orderService) {
        this.orderService = orderService;
    }

    @Override
    public void afterPropertiesSet() {
        String key = System.getenv("STRIPE_SECRET");
        if (key == null || key.isBlank()) {
            key = System.getenv("STRIPE_KEY");
        }
        if (key != null && !key.isBlank()) {
            Stripe.apiKey = key;
        }
    }

    public Map<String,Object> createPaymentIntent(long amount, String currency, Map<String,String> metadata) throws StripeException {
        PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency == null ? "usd" : currency)
                .setAutomaticPaymentMethods(PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build());

        if (metadata != null) builder.putAllMetadata(metadata);

        PaymentIntent pi = PaymentIntent.create(builder.build());
        Map<String,Object> out = new HashMap<>();
        out.put("client_secret", pi.getClientSecret());
        out.put("id", pi.getId());
        return out;
    }

    public Event constructEvent(String payload, String sigHeader) throws SignatureVerificationException {
        String webhookSecret = System.getenv("STRIPE_WEBHOOK_SECRET");
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("STRIPE_WEBHOOK_SECRET environment variable not set");
        }
        return Webhook.constructEvent(payload, sigHeader, webhookSecret);
    }

    public void handleEvent(Event event) throws Exception {
        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
            if (pi != null) {
                Map<String,String> md = pi.getMetadata();
                String uid = md != null ? md.get("uid") : null;
                String basketJson = md != null ? md.get("basket") : null;
                Map<String,Object> order = new HashMap<>();
                order.put("amount", pi.getAmount());
                order.put("paymentIntentId", pi.getId());
                order.put("basket", basketJson == null ? null : basketJson);
                if (uid != null) {
                    orderService.createOrder(uid, order);
                }
            }
        }
    }
}
