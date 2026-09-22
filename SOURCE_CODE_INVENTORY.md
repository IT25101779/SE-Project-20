# Source Code Inventory - Viveka M.C. (`IT25101771`)
## Assigned Core Function: **Online Booking & Seat Selection**
### Group ID: `2026-Y2-S1-KU-20` | Course: SE2030

This document catalogues all files, components, and controllers authored and maintained by **Viveka M.C.** for the **Online Booking & Seat Selection** module.

---

## 📂 Authored Code & Components List

- [`BookingController.java`](./backend/src/main/java/com/busreservation/controller/BookingController.java) — `backend/src/main/java/com/busreservation/controller/BookingController.java`
- [`BookingService.java`](./backend/src/main/java/com/busreservation/service/BookingService.java) — `backend/src/main/java/com/busreservation/service/BookingService.java`
- [`QrCodeService.java`](./backend/src/main/java/com/busreservation/service/QrCodeService.java) — `backend/src/main/java/com/busreservation/service/QrCodeService.java`
- [`Booking.java`](./backend/src/main/java/com/busreservation/entity/Booking.java) — `backend/src/main/java/com/busreservation/entity/Booking.java`
- [`Seat.java`](./backend/src/main/java/com/busreservation/entity/Seat.java) — `backend/src/main/java/com/busreservation/entity/Seat.java`
- [`WaitingList.java`](./backend/src/main/java/com/busreservation/entity/WaitingList.java) — `backend/src/main/java/com/busreservation/entity/WaitingList.java`
- [`BookingRepository.java`](./backend/src/main/java/com/busreservation/repository/BookingRepository.java) — `backend/src/main/java/com/busreservation/repository/BookingRepository.java`
- [`SeatRepository.java`](./backend/src/main/java/com/busreservation/repository/SeatRepository.java) — `backend/src/main/java/com/busreservation/repository/SeatRepository.java`
- [`WaitingListRepository.java`](./backend/src/main/java/com/busreservation/repository/WaitingListRepository.java) — `backend/src/main/java/com/busreservation/repository/WaitingListRepository.java`
- [`BookingEvent.java`](./backend/src/main/java/com/busreservation/pattern/observer/BookingEvent.java) — `backend/src/main/java/com/busreservation/pattern/observer/BookingEvent.java`
- [`BookingEventPublisher.java`](./backend/src/main/java/com/busreservation/pattern/observer/BookingEventPublisher.java) — `backend/src/main/java/com/busreservation/pattern/observer/BookingEventPublisher.java`
- [`CreateBookingRequest.java`](./backend/src/main/java/com/busreservation/dto/CreateBookingRequest.java) — `backend/src/main/java/com/busreservation/dto/CreateBookingRequest.java`
- [`BookingResponse.java`](./backend/src/main/java/com/busreservation/dto/BookingResponse.java) — `backend/src/main/java/com/busreservation/dto/BookingResponse.java`
- [`BookingGroupResponse.java`](./backend/src/main/java/com/busreservation/dto/BookingGroupResponse.java) — `backend/src/main/java/com/busreservation/dto/BookingGroupResponse.java`
- [`SeatMapEntry.java`](./backend/src/main/java/com/busreservation/dto/SeatMapEntry.java) — `backend/src/main/java/com/busreservation/dto/SeatMapEntry.java`
- [`ManifestEntryDto.java`](./backend/src/main/java/com/busreservation/dto/ManifestEntryDto.java) — `backend/src/main/java/com/busreservation/dto/ManifestEntryDto.java`
- [`SeatMap.tsx`](./frontend/src/components/SeatMap.tsx) — `frontend/src/components/SeatMap.tsx`
- [`MyBookings.tsx`](./frontend/src/pages/MyBookings.tsx) — `frontend/src/pages/MyBookings.tsx`

---

## 🎯 Viva Demonstration Checklist for Viveka M.C.
1. **Source Code Walkthrough:** Be prepared to explain methods inside the controllers and services listed above.
2. **Design Pattern Justification:** Explain why **Observer Pattern (Booking Events) & Reservation State Pattern** was chosen and how it prevents code duplication and enforces software engineering principles.
3. **Database Integrity:** Explain the relationships between tables listed in `README.md`.
4. **Live Execution:** Demonstrate the endpoints listed in the CRUD table of `README.md` using either the React UI or Postman.
