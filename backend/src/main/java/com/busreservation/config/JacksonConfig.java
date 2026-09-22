package com.busreservation.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Without this, returning a JPA entity with a lazy-loaded association
 * (e.g. Booking -> Schedule, Booking -> Seat) straight from a controller
 * makes Jackson try to serialize Hibernate's internal ByteBuddy proxy
 * object instead of the real data, crashing with something like:
 * "No serializer found for class ...pojo.bytebuddy.ByteBuddyInterceptor".
 *
 * Hibernate6Module teaches Jackson how to unwrap these proxies properly.
 * FORCE_LAZY_LOADING is safe here because spring.jpa.open-in-view is
 * enabled (see application.yml) - the database session is still open
 * while the response is being written, so Jackson can trigger the extra
 * query needed to load the real data instead of failing.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, true);
        return module;
    }
}
