# SLIIT SE2030 - Web-Based Bus Ticket Reservation System
## Group ID: `2026-Y2-S1-KU-20`
### Member 4 Individual Submission: **Weerasekara W.M.A.G.B.** (`IT25101779`)

---

## 📌 Executive Summary & Assigned Core Function

- **Student Name:** Weerasekara W.M.A.G.B.
- **Student ID:** `IT25101779`
- **Assigned Core Function:** **Real-Time Bus Tracking**
- **Target Stakeholders:** Passenger (Live Map Tracking), Driver (GPS Broadcast), Fleet Operations Supervisor
- **Software Engineering Course:** SE2030 - Object-Oriented Software Engineering / Group Project
- **Institution:** Sri Lanka Institute of Information Technology (SLIIT)

This repository contains the complete, compilable, and executable implementation of the **Web-Based Bus Ticket Reservation System**, featuring the deep-dive implementation and testing of **Real-Time Bus Tracking** authored by **Weerasekara W.M.A.G.B. (IT25101779)**.

---

## ⚙️ Primary Software Design Pattern

- **Design Pattern:** **Observer Pattern (WebSocket / STOMP Pub-Sub Architecture)**
- **Pattern Classification:** Behavioral & Distributed Messaging Pattern
- **Key Implementation Files:** `backend/src/main/java/com/busreservation/config/WebSocketConfig.java & TrackingService.java`
- **Pattern Description & Justification:**
  > Uses Spring STOMP over WebSockets. Driver location telemetry is ingested and broadcast to topic subscribers (/topic/bus/{scheduleId}) in real time, updating passenger Leaflet maps without polling.

### Viva Defense & Architecture Explanation:
Explain how STOMP WebSockets eliminate HTTP polling overhead for GPS tracking. Show the driver updating location in DriverDashboard.tsx and how TrackingMap.tsx instantly moves the bus pin on the Leaflet map.

---

## 🔄 CRUD Operations Breakdown (Assigned to Weerasekara W.M.A.G.B.)

The following table documents the complete CRUD (Create, Read, Update, Delete) suite implemented, tested, and maintained by **Weerasekara W.M.A.G.B.**:

| Operation | HTTP Method | API Endpoint | Request Payload / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api/tracking/update` | `{ scheduleId, latitude, longitude, speed, heading }` | Driver mobile app or GPS beacon publishes vehicle coordinates. |
| **Read** | `GET` | `/api/tracking/schedule/{scheduleId}` | `None` | Fetches current live GPS coordinates, speed, and ETA for a schedule. |
| **Read** | `GET` | `/api/tracking/fleet` | `None` | Fleet supervisor views real-time locations and operational status of all active buses. |
| **Read** | `GET` | `/api/tracking/history/{scheduleId}` | `None` | Retrieves GPS trail history breadcrumbs for route replay. |
| **Update** | `POST` | `/api/driver/schedules/{id}/start` | `None` | Driver starts trip, transitioning tracking state to IN_PROGRESS. |
| **Delete** | `POST` | `/api/driver/schedules/{id}/complete` | `None` | Driver ends trip, terminating active GPS broadcast session. |

---

## 🗄️ Database Schema & Entities

The following database tables represent the core entities managed by this module:

| Table Name | Entity Description & Relationships |
| :--- | :--- |
| `gps_logs` | Historical telemetry records tracking bus schedule ID, latitude, longitude, speed (km/h), heading, and recorded timestamp. |

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
