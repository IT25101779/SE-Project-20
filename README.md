# SLIIT SE2030 - Web-Based Bus Ticket Reservation System
## Group ID: `2026-Y2-S1-KU-20`
### Member 6 Individual Submission: **Wijewardana D.S.** (`IT25101763`)

---

## 📌 Executive Summary & Assigned Core Function

- **Student Name:** Wijewardana D.S.
- **Student ID:** `IT25101763`
- **Assigned Core Function:** **Notification & Alert Management**
- **Target Stakeholders:** Passenger (Notifications & Help), Customer Support Agent (Support Tickets)
- **Software Engineering Course:** SE2030 - Object-Oriented Software Engineering / Group Project
- **Institution:** Sri Lanka Institute of Information Technology (SLIIT)

This repository contains the complete, compilable, and executable implementation of the **Web-Based Bus Ticket Reservation System**, featuring the deep-dive implementation and testing of **Notification & Alert Management** authored by **Wijewardana D.S. (IT25101763)**.

---

## ⚙️ Primary Software Design Pattern

- **Design Pattern:** **Factory Method Pattern & Observer Pattern**
- **Pattern Classification:** Creational & Behavioral Pattern
- **Key Implementation Files:** `backend/src/main/java/com/busreservation/pattern/notification/NotificationFactory.java & NotificationEventListener.java`
- **Pattern Description & Justification:**
  > NotificationFactory instantiates concrete notification channels (EMAIL, SMS, IN_APP). NotificationEventListener observes system domain events (booking confirmation, trip delays) and automatically dispatches alerts.

### Viva Defense & Architecture Explanation:
Explain how NotificationFactory decouples notification creation from delivery logic. Demonstrate receiving an alert when a booking is confirmed or when an admin delays a bus schedule.

---

## 🔄 CRUD Operations Breakdown (Assigned to Wijewardana D.S.)

The following table documents the complete CRUD (Create, Read, Update, Delete) suite implemented, tested, and maintained by **Wijewardana D.S.**:

| Operation | HTTP Method | API Endpoint | Request Payload / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api/notifications/broadcast` | `{ title, message, type }` | Admin or support broadcasts system-wide service alerts to all users. |
| **Create** | `POST` | `/api/support/tickets` | `{ subject, category, description }` | Passenger creates a support ticket for assistance. |
| **Read** | `GET` | `/api/notifications` | `None (Bearer Token)` | Passenger views notification feed with unread count. |
| **Read** | `GET` | `/api/support/tickets` | `None` | Support agents view and filter customer inquiry tickets. |
| **Update** | `PATCH` | `/api/notifications/{id}/read` | `None` | Marks an individual notification as read. |
| **Update** | `PATCH` | `/api/notifications/read-all` | `None` | Marks all user notifications as read in bulk. |
| **Update** | `PUT` | `/api/support/tickets/{id}/status` | `{ status: RESOLVED }` | Support agent resolves customer ticket with resolution remarks. |
| **Delete** | `DELETE` | `/api/notifications/{id}` | `None` | User removes or dismisses a notification from their inbox. |

---

## 🗄️ Database Schema & Entities

The following database tables represent the core entities managed by this module:

| Table Name | Entity Description & Relationships |
| :--- | :--- |
| `notifications` | Stores in-app messages and broadcast alerts with title, body, notification type, read status (isRead), recipient user, and creation timestamp. |

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
