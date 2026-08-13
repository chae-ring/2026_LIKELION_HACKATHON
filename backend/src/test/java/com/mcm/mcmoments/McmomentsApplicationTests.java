package com.mcm.mcmoments;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"jwt.secret=test-secret-key-must-be-at-least-32-characters-long",
		"jwt.expiration=3600000",
		"google.client-id=test-client-id",
		"google.client-secret=test-client-secret",
		"google.redirect-uri=http://localhost/test-callback"
})
class McmomentsApplicationTests {

	@Test
	void contextLoads() {
	}

}
