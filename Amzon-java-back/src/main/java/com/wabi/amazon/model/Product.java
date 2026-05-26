package com.wabi.amazon.model;

import java.time.Instant;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.Map;

public class Product {
    private String id;
    @NotBlank(message = "title is required")
    private String title;
    private String description;
    private String image;
    @Min(value = 0, message = "price must be >= 0")
    private long price; // cents
    private Instant created;

    public Product() {}

    public Product(String id, String title, String description, String image, long price, Instant created) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.image = image;
        this.price = price;
        this.created = created;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public Instant getCreated() { return created; }
    public void setCreated(Instant created) { this.created = created; }

    public Map<String, Object> toMap() {
        Map<String,Object> m = new HashMap<>();
        m.put("title", title);
        m.put("description", description);
        m.put("image", image);
        m.put("price", price);
        m.put("created", created == null ? null : com.google.cloud.Timestamp.ofTimeSecondsAndNanos(created.getEpochSecond(), created.getNano()));
        return m;
    }
}
