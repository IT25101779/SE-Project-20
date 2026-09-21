package com.busreservation.service;

import com.busreservation.dto.CreateReviewRequest;
import com.busreservation.dto.ReviewDto;
import com.busreservation.dto.RouteRatingDto;
import com.busreservation.entity.Booking;
import com.busreservation.entity.Review;
import com.busreservation.entity.User;
import com.busreservation.repository.BookingRepository;
import com.busreservation.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/** Minor function: post-trip passenger rating/feedback. */
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public ReviewDto submitReview(User passenger, CreateReviewRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getPassenger().getId().equals(passenger.getId())) {
            throw new IllegalStateException("You can only review your own bookings.");
        }
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed/completed bookings can be reviewed.");
        }
        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new IllegalStateException("You have already reviewed this trip.");
        }

        Review review = Review.builder()
                .booking(booking)
                .passenger(passenger)
                .rating(request.rating())
                .comment(request.comment())
                .build();
        review = reviewRepository.save(review);

        return new ReviewDto(review.getId(), passenger.getName(), review.getRating(), review.getComment());
    }

    @Transactional(readOnly = true)
    public RouteRatingDto getRouteRating(Long routeId) {
        List<Review> reviews = reviewRepository.findByBooking_Schedule_Route_Id(routeId);
        if (reviews.isEmpty()) {
            return new RouteRatingDto(0, 0);
        }
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        return new RouteRatingDto(Math.round(avg * 10.0) / 10.0, reviews.size());
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getRouteReviews(Long routeId) {
        return reviewRepository.findByBooking_Schedule_Route_Id(routeId).stream()
                .map(r -> new ReviewDto(r.getId(), r.getPassenger().getName(), r.getRating(), r.getComment()))
                .collect(Collectors.toList());
    }
}
