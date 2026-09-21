-- ============================================================================
-- Seed data for the Web-Based Bus Ticket Reservation System
-- Runs automatically on startup (spring.sql.init.mode=always).
-- Safe to re-run: DELETEs existing demo rows first.
-- SQL Server (MSSQL) compatible syntax.
-- ============================================================================

-- Disable foreign key constraints during data cleanup to prevent Msg 547 reference conflicts
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";

DELETE FROM waiting_list;
DELETE FROM reviews;
DELETE FROM notifications;
DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM gps_logs;
DELETE FROM schedules;
DELETE FROM seats;
DELETE FROM stops;
DELETE FROM routes;
DELETE FROM buses;
DELETE FROM audit_logs;
DELETE FROM users;

-- ---------------------------------------------------------------------------
-- Demo accounts. Shared password for ALL demo accounts: Demo@1234
-- ---------------------------------------------------------------------------
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, name, email, phone, password_hash, role, preferred_language, failed_login_attempts, active, created_at) VALUES
(1, 'Admin User',       'admin@demo.com',      '0771000001', '$2b$10$PQF/pEDsefV5vMH4omfmCOy3TJEp59bX/X/LSSuUalkUvTr238mla', 'ADMIN',          'en', 0, 1, GETDATE()),
(2, 'Sandra Support',   'support@demo.com',    '0771000002', '$2b$10$PQF/pEDsefV5vMH4omfmCOy3TJEp59bX/X/LSSuUalkUvTr238mla', 'SUPPORT_STAFF',  'en', 0, 1, GETDATE()),
(3, 'Farook Finance',   'finance@demo.com',    '0771000003', '$2b$10$PQF/pEDsefV5vMH4omfmCOy3TJEp59bX/X/LSSuUalkUvTr238mla', 'FINANCE_OFFICER','en', 0, 1, GETDATE()),
(4, 'Dinesh Driver',    'driver@demo.com',     '0771000004', '$2b$10$PQF/pEDsefV5vMH4omfmCOy3TJEp59bX/X/LSSuUalkUvTr238mla', 'DRIVER',         'en', 0, 1, GETDATE()),
(5, 'Nimal Perera',     'passenger@demo.com',  '0771000005', '$2b$10$PQF/pEDsefV5vMH4omfmCOy3TJEp59bX/X/LSSuUalkUvTr238mla', 'PASSENGER',      'en', 0, 1, GETDATE()),
(6, 'Kumari Silva',     'passenger2@demo.com', '0771000006', '$2b$10$PQF/pEDsefV5vMH4omfmCOy3TJEp59bX/X/LSSuUalkUvTr238mla', 'PASSENGER',      'en', 0, 1, GETDATE());
SET IDENTITY_INSERT users OFF;

-- ---------------------------------------------------------------------------
-- Fleet (54 seats each, with driver info)
-- ---------------------------------------------------------------------------
SET IDENTITY_INSERT buses ON;
INSERT INTO buses (id, plate_number, bus_type, seat_capacity, unavailable, driver_name, driver_phone, license_number, bus_photo_url) VALUES
(1, 'NB-1234', 'Luxury',      54, 0, 'Nimal Bandara',    '0771234567', 'B2456789', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'),
(2, 'NB-5678', 'Semi-Luxury', 54, 0, 'Sampath Perera',   '0779876543', 'B3345678', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'),
(3, 'NC-1111', 'Luxury',      54, 0, 'Roshan Fernando',  '0761122334', 'B4456789', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
(4, 'NC-2222', 'Normal',      54, 0, 'Kamal Jayawardena','0752233445', 'B5567890', 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800'),
(5, 'NC-3333', 'Semi-Luxury', 54, 1, 'Asanka Wijesinghe','0763344556', 'B6678901', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800');
SET IDENTITY_INSERT buses OFF;

UPDATE buses SET unavailability_reason = 'Scheduled maintenance - engine inspection' WHERE id = 5;

-- ---------------------------------------------------------------------------
-- Seats: 54 per active bus (1-4)
-- Rows 1-12: 4 seats each (A=left-window, B=left-aisle, C=right-aisle, D=right-window)
-- Row 13: 6 seats (A, B, C = left side, D, E, F = right side)
-- ---------------------------------------------------------------------------
-- Standard rows (1-12), 4 seats each
INSERT INTO seats (bus_id, seat_number, seat_type, row_number, column_number)
SELECT b.id,
       CAST(r.rn AS VARCHAR) + c.suffix,
       'STANDARD',
       r.rn,
       c.col
FROM buses b
CROSS JOIN (SELECT 1 AS rn UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
            UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) r
CROSS JOIN (SELECT 1 AS col, 'A' AS suffix UNION SELECT 2,'B' UNION SELECT 3,'C' UNION SELECT 4,'D') c
WHERE b.id IN (1,2,3,4);

-- Last row (row 13), 6 seats
INSERT INTO seats (bus_id, seat_number, seat_type, row_number, column_number)
SELECT b.id,
       '13' + c.suffix,
       'STANDARD',
       13,
       c.col
FROM buses b
CROSS JOIN (SELECT 1 AS col, 'A' AS suffix UNION SELECT 2,'B' UNION SELECT 3,'C'
            UNION SELECT 4,'D' UNION SELECT 5,'E' UNION SELECT 6,'F') c
WHERE b.id IN (1,2,3,4);

-- ---------------------------------------------------------------------------
-- Routes
-- ---------------------------------------------------------------------------
SET IDENTITY_INSERT routes ON;
INSERT INTO routes (id, name, origin_city, destination_city, distance_km, estimated_duration_minutes) VALUES
(1, 'Colombo - Kandy',  'Colombo', 'Kandy',  115, 180),
(2, 'Colombo - Galle',  'Colombo', 'Galle',  120, 150),
(3, 'Colombo - Jaffna', 'Colombo', 'Jaffna', 396, 420),
(4, 'Kandy - Ella',     'Kandy',   'Ella',   140, 300);
SET IDENTITY_INSERT routes OFF;

-- Route 1: Colombo - Kandy
INSERT INTO stops (route_id, name, sequence_order, latitude, longitude, pickup_allowed, drop_allowed) VALUES
(1, 'Colombo Fort',   0, 6.9344, 79.8428, 1, 0),
(1, 'Kadawatha',      1, 6.9855, 79.9508, 1, 1),
(1, 'Kegalle',        2, 7.2513, 80.3464, 1, 1),
(1, 'Kandy',          3, 7.2906, 80.6337, 0, 1);

-- Route 2: Colombo - Galle
INSERT INTO stops (route_id, name, sequence_order, latitude, longitude, pickup_allowed, drop_allowed) VALUES
(2, 'Colombo Fort',   0, 6.9344, 79.8428, 1, 0),
(2, 'Kalutara',       1, 6.5854, 79.9607, 1, 1),
(2, 'Ambalangoda',    2, 6.2367, 80.0546, 1, 1),
(2, 'Galle',          3, 6.0535, 80.2210, 0, 1);

-- Route 3: Colombo - Jaffna
INSERT INTO stops (route_id, name, sequence_order, latitude, longitude, pickup_allowed, drop_allowed) VALUES
(3, 'Colombo Fort',   0, 6.9344, 79.8428, 1, 0),
(3, 'Kurunegala',     1, 7.4867, 80.3647, 1, 1),
(3, 'Anuradhapura',   2, 8.3114, 80.4037, 1, 1),
(3, 'Jaffna',         3, 9.6615, 80.0255, 0, 1);

-- Route 4: Kandy - Ella
INSERT INTO stops (route_id, name, sequence_order, latitude, longitude, pickup_allowed, drop_allowed) VALUES
(4, 'Kandy',          0, 7.2906, 80.6337, 1, 0),
(4, 'Nuwara Eliya',   1, 6.9497, 80.7891, 1, 1),
(4, 'Bandarawela',    2, 6.8333, 80.9833, 1, 1),
(4, 'Ella',           3, 6.8667, 81.0466, 0, 1);

-- ---------------------------------------------------------------------------
-- Schedules (Daily demo schedules for today and future dates)
-- ---------------------------------------------------------------------------
SET IDENTITY_INSERT schedules ON;
INSERT INTO schedules (id, bus_id, route_id, departure_time, arrival_time, status) VALUES
(1, 1, 1, DATEADD(hour, 6, CAST(CAST(GETDATE() AS DATE) AS DATETIME)), DATEADD(hour, 9, CAST(CAST(GETDATE() AS DATE) AS DATETIME)), 'SCHEDULED'),
(2, 2, 2, DATEADD(hour, 8, CAST(CAST(GETDATE() AS DATE) AS DATETIME)), DATEADD(hour, 10, DATEADD(minute, 30, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 'SCHEDULED'),
(3, 3, 3, DATEADD(hour, 5, CAST(CAST(GETDATE() AS DATE) AS DATETIME)), DATEADD(hour, 12, CAST(CAST(GETDATE() AS DATE) AS DATETIME)), 'SCHEDULED'),
(4, 4, 4, DATEADD(hour, 7, CAST(CAST(GETDATE() AS DATE) AS DATETIME)), DATEADD(hour, 12, CAST(CAST(GETDATE() AS DATE) AS DATETIME)), 'SCHEDULED'),
(5, 1, 1, DATEADD(day, 1, DATEADD(hour, 6, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), DATEADD(day, 1, DATEADD(hour, 9, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 'SCHEDULED'),
(6, 2, 2, DATEADD(day, 1, DATEADD(hour, 8, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), DATEADD(day, 1, DATEADD(hour, 10, DATEADD(minute, 30, CAST(CAST(GETDATE() AS DATE) AS DATETIME)))), 'SCHEDULED'),
(7, 3, 3, DATEADD(day, 1, DATEADD(hour, 5, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), DATEADD(day, 1, DATEADD(hour, 12, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 'SCHEDULED'),
(8, 4, 4, DATEADD(day, 1, DATEADD(hour, 7, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), DATEADD(day, 1, DATEADD(hour, 12, CAST(CAST(GETDATE() AS DATE) AS DATETIME))), 'SCHEDULED');
SET IDENTITY_INSERT schedules OFF;

-- Re-enable all foreign key constraints
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";


