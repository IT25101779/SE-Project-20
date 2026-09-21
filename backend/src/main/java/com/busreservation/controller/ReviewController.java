package com.busreservation.controller;

import com.busreservation.dto.CreateReviewRequest;
import com.busreservation.dto.ReviewDto;
import com.busreservation.dto.RouteRatingDto;
import com.busreservation.entity.User;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Minor function: post-trip passenger rating/feedback. */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ReviewDto submit(@Valid @RequestBody CreateReviewRequest request) {
        User passenger = currentUserProvider.getCurrentUser();
        return reviewService.submitReview(passenger, request);
    }

    @GetMapping("/route/{routeId}/rating")
    public RouteRatingDto routeRating(@PathVariable Long routeId) {
        return reviewService.getRouteRating(routeId);
    }

    @GetMapping("/route/{routeId}")
    public List<ReviewDto> routeReviews(@PathVariable Long routeId) {
        return reviewService.getRouteReviews(routeId);
    }
}
