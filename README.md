# SLIIT SE2030 - Web-Based Bus Ticket Reservation System
## Group ID: `2026-Y2-S1-KU-20`
### Member 3 Individual Submission: **Viveka M.C.** (`IT25101771`)

---

## 📌 Executive Summary & Assigned Core Function

- **Student Name:** Viveka M.C.
- **Student ID:** `IT25101771`
- **Assigned Core Function:** **Online Booking & Seat Selection**
- **Target Stakeholders:** Passenger (Booking & Seat Map), Conductor/Driver (Passenger Manifest)
- **Software Engineering Course:** SE2030 - Object-Oriented Software Engineering / Group Project
- **Institution:** Sri Lanka Institute of Information Technology (SLIIT)

This repository contains the complete, compilable, and executable implementation of the **Web-Based Bus Ticket Reservation System**, featuring the deep-dive implementation and testing of **Online Booking & Seat Selection** authored by **Viveka M.C. (IT25101771)**.

---

## ⚙️ Primary Software Design Pattern

- **Design Pattern:** **Observer Pattern (Booking Events) & Reservation State Pattern**
- **Pattern Classification:** Behavioral Pattern
- **Key Implementation Files:** `backend/src/main/java/com/busreservation/pattern/observer/BookingEventPublisher.java & BookingEvent.java`
- **Pattern Description & Justification:**
  > Decouples the booking workflow from notifications and telemetry. When a seat reservation state changes (PENDING -> CONFIRMED -> CANCELLED), events are dispatched asynchronously to observers.

### Viva Defense & Architecture Explanation:
Demonstrate the 54-seat grid in SeatMap.tsx (12 rows of 4 + 1 back row of 6). Explain how concurrent booking conflicts are prevented in BookingService using transactional locking on seat records.

---

## 🔄 CRUD Operations Breakdown (Assigned to Viveka M.C.)

The following table documents the complete CRUD (Create, Read, Update, Delete) suite implemented, tested, and maintained by **Viveka M.C.**:

| Operation | HTTP Method | API Endpoint | Request Payload / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api/bookings` | `{ scheduleId, seatNumbers, pickupStop, dropStop, passengerName, passengerPhone }` | Reserves selected seats, creates booking in PENDING status, and initiates payment lock. |
| **Read** | `GET` | `/api/bookings/schedule/{scheduleId}/seats` | `None` | Fetches interactive 54-seat layout with real-time booked/available status. |
| **Read** | `GET` | `/api/bookings/my-bookings` | `None (Bearer Token)` | Returns passenger booking history with QR code verification data. |
| **Read** | `GET` | `/api/bookings/{id}` | `None` | Retrieves booking summary, ticket breakdown, and boarding pass. |
| **Update** | `PUT` | `/api/bookings/{id}/boarding-points` | `{ pickupStop, dropStop }` | Passenger updates selected boarding or destination stop before departure. |
| **Delete** | `PUT / DELETE` | `/api/bookings/{id}/cancel` | `None` | Cancels booking, releases seats back to available inventory, and fires cancellation event. |

---

## 🗄️ Database Schema & Entities

The following database tables represent the core entities managed by this module:

| Table Name | Entity Description & Relationships |
| :--- | :--- |
| `bookings` | Stores seat bookings with reference code, passenger details, pickup/drop stops, total fare, and status (PENDING, CONFIRMED, CANCELLED). |
| `seats` | Physical seat records for each bus (rows 1-12 with A/B/C/D, row 13 with A/B/C/D/E/F = 54 seats). |
| `waiting_list` | Queued passengers requesting notification when a fully-booked bus has seat cancellations. |

---

## 🚀 Step-by-Step Running & Verification Guide

Examiners and evaluators can run and test this module in under 3 minutes:

### Prerequisites
1. **Java JDK 17+** installed (`java -version`)
2. **Maven 3.8+** installed (`mvn -version`)
3. **Node.js 18+** & npm installed (`node -v`)
4. **SQL Server** or **H2 in-memory database** (configured in `application.yml`)

### 1. Start the Backend API (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
*The server will boot on:* `http://localhost:8080`  
*Pre-seeded database migrations will execute automatically from `data.sql`.*

### 2. Start the Frontend Application (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*The client will launch on:* `http://localhost:5173`

### 3. Demo Test Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@bus.lk` | `admin123` |
| **Operations / Support** | `support@bus.lk` | `support123` |
| **Driver** | `driver1@bus.lk` | `driver123` |
| **Finance Officer** | `finance@bus.lk` | `finance123` |
| **Passenger** | `kamal@gmail.com` | `kamal123` |

---

## 📁 Source Code Inventory

A detailed breakdown of all Java classes, controllers, services, repositories, and React UI components authored for this core function is documented in [SOURCE_CODE_INVENTORY.md](./SOURCE_CODE_INVENTORY.md).
