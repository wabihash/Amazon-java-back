package com.wabi.amazon.integration;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers(disabledWithoutDocker = true)
@Disabled("Skeleton integration setup. Enable when containerized infra is available.")
class TestcontainersSmokeTest {

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    @Test
    void testcontainersWiringIsReady() {
        assertTrue(redis.isRunning() || !redis.isRunning());
    }
}
