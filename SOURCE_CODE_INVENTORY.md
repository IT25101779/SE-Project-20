# Source Code Inventory - Weerasekara W.M.A.G.B. (`IT25101779`)
## Assigned Core Function: **Real-Time Bus Tracking**
### Group ID: `2026-Y2-S1-KU-20` | Course: SE2030

This document catalogues all files, components, and controllers authored and maintained by **Weerasekara W.M.A.G.B.** for the **Real-Time Bus Tracking** module.

---

## 📂 Authored Code & Components List

- [`TrackingController.java`](./backend/src/main/java/com/busreservation/controller/TrackingController.java) — `backend/src/main/java/com/busreservation/controller/TrackingController.java`
- [`DriverController.java`](./backend/src/main/java/com/busreservation/controller/DriverController.java) — `backend/src/main/java/com/busreservation/controller/DriverController.java`
- [`TrackingService.java`](./backend/src/main/java/com/busreservation/service/TrackingService.java) — `backend/src/main/java/com/busreservation/service/TrackingService.java`
- [`DriverService.java`](./backend/src/main/java/com/busreservation/service/DriverService.java) — `backend/src/main/java/com/busreservation/service/DriverService.java`
- [`GpsLog.java`](./backend/src/main/java/com/busreservation/entity/GpsLog.java) — `backend/src/main/java/com/busreservation/entity/GpsLog.java`
- [`GpsLogRepository.java`](./backend/src/main/java/com/busreservation/repository/GpsLogRepository.java) — `backend/src/main/java/com/busreservation/repository/GpsLogRepository.java`
- [`WebSocketConfig.java`](./backend/src/main/java/com/busreservation/config/WebSocketConfig.java) — `backend/src/main/java/com/busreservation/config/WebSocketConfig.java`
- [`GpsPositionDto.java`](./backend/src/main/java/com/busreservation/dto/GpsPositionDto.java) — `backend/src/main/java/com/busreservation/dto/GpsPositionDto.java`
- [`FleetTrackingDto.java`](./backend/src/main/java/com/busreservation/dto/FleetTrackingDto.java) — `backend/src/main/java/com/busreservation/dto/FleetTrackingDto.java`
- [`DriverScheduleDto.java`](./backend/src/main/java/com/busreservation/dto/DriverScheduleDto.java) — `backend/src/main/java/com/busreservation/dto/DriverScheduleDto.java`
- [`TrackingMap.tsx`](./frontend/src/components/TrackingMap.tsx) — `frontend/src/components/TrackingMap.tsx`
- [`DriverDashboard.tsx`](./frontend/src/pages/DriverDashboard.tsx) — `frontend/src/pages/DriverDashboard.tsx`

---

## 🎯 Viva Demonstration Checklist for Weerasekara W.M.A.G.B.
1. **Source Code Walkthrough:** Be prepared to explain methods inside the controllers and services listed above.
2. **Design Pattern Justification:** Explain why **Observer Pattern (WebSocket / STOMP Pub-Sub Architecture)** was chosen and how it prevents code duplication and enforces software engineering principles.
3. **Database Integrity:** Explain the relationships between tables listed in `README.md`.
4. **Live Execution:** Demonstrate the endpoints listed in the CRUD table of `README.md` using either the React UI or Postman.
