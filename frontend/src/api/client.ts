import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";

    // If 401 Unauthorized or 403 Forbidden with existing token, the session is stale or expired
    if ((status === 401 || status === 403) && localStorage.getItem("token")) {
      const isAuthRoute = error.config?.url?.includes("/auth/");
      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
        toast.error("Session expired or unauthorized. Please sign in again.");
      }
    }

    return Promise.reject(new Error(message));
  }
);

// ---------------------------------------------------------------------------
// Types mirroring the backend DTOs
// ---------------------------------------------------------------------------
export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface StopDto {
  id: number;
  name: string;
  sequenceOrder: number;
  latitude: number;
  longitude: number;
  pickupAllowed: boolean;
  dropAllowed: boolean;
}

export interface ScheduleSearchResult {
  scheduleId: number;
  busPlateNumber: string;
  busType: string;
  routeName: string;
  routeId: number;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  averageRating: number;
  reviewCount: number;
  stops: StopDto[];
  scheduleStatus: string;
  driverName: string | null;
  driverPhone: string | null;
  licenseNumber: string | null;
  busPhotoUrl: string | null;
  busId: number;
}

export interface BookingResponse {
  bookingId: number;
  status: string;
  ticketReference: string;
  seatNumber: string;
  pickupStopName: string;
  dropStopName: string;
  travelDate: string;
  holdExpiresAt: string | null;
  qrCodeBase64: string | null;
}

export interface BookingGroupResponse {
  groupRef: string;
  bookings: BookingResponse[];
  totalFare: number;
  holdExpiresAt: string | null;
  paymentFailureReason: string | null;
}

export interface SeatMapEntry {
  seatId: number;
  seatNumber: string;
  seatType: string;
  occupied: boolean;
  rowNumber: number;
  columnNumber: number;
}

export interface Bus {
  id: number;
  plateNumber: string;
  busType: string;
  seatCapacity: number;
  unavailable: boolean;
  unavailabilityReason: string | null;
  driverName: string | null;
  driverPhone: string | null;
  licenseNumber: string | null;
  busPhotoUrl: string | null;
}

export interface Route {
  id: number;
  name: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  stops: StopDto[];
}

export interface AuditLogEntry {
  id: number;
  staffName: string;
  action: string;
  entityName: string;
  entityId: number;
  details: string;
  timestamp: string;
}

export interface GpsPositionDto {
  scheduleId: number;
  scheduleStatus: "SCHEDULED" | "IN_TRIP" | "DELAYED" | "CANCELLED" | "COMPLETED";
  latitude: number;
  longitude: number;
  minutesToDeparture: number | null;
  etaToArrival: string | null;
  distanceRemainingKm: number;
  targetStopId: number;
  targetStopName: string;
  etaToTargetStop: string | null;
  distanceToTargetStopKm: number;
  targetStopAlreadyPassed: boolean;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------
export const AuthApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
};

export const ScheduleApi = {
  search: (origin: string, destination: string, dateIso: string) =>
    api
      .get<ScheduleSearchResult[]>("/schedules/search", {
        params: { origin, destination, date: dateIso },
      })
      .then((r) => r.data),
  seatMap: (scheduleId: number) =>
    api.get<SeatMapEntry[]>(`/schedules/${scheduleId}/seats`).then((r) => r.data),
};

export interface UserEntry {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export const AdminApi = {
  getBuses: () => api.get<Bus[]>("/admin/buses").then((r) => r.data),
  createBus: (data: { plateNumber: string; busType: string; seatCapacity: number }) =>
    api.post<Bus>("/admin/buses", data).then((r) => r.data),
  deleteBus: (id: number) => api.delete(`/admin/buses/${id}`).then((r) => r.data),
  setBusUnavailable: (id: number, reason: string) =>
    api.patch<Bus>(`/admin/buses/${id}/unavailable`, null, { params: { reason } }).then((r) => r.data),
  setBusAvailable: (id: number) =>
    api.patch<Bus>(`/admin/buses/${id}/available`).then((r) => r.data),

  getRoutes: () => api.get<Route[]>("/admin/routes").then((r) => r.data),
  createRoute: (data: {
    name: string;
    originCity: string;
    destinationCity: string;
    distanceKm: number;
    estimatedDurationMinutes: number;
  }) => api.post<Route>("/admin/routes", data).then((r) => r.data),
  updateRoute: (
    id: number,
    data: {
      name: string;
      originCity: string;
      destinationCity: string;
      distanceKm: number;
      estimatedDurationMinutes: number;
    }
  ) => api.put<Route>(`/admin/routes/${id}`, data).then((r) => r.data),
  deleteRoute: (id: number) => api.delete(`/admin/routes/${id}`).then((r) => r.data),
  getStops: (routeId: number) =>
    api.get<StopDto[]>(`/admin/routes/${routeId}/stops`).then((r) => r.data),
  addStop: (
    routeId: number,
    data: { name: string; sequenceOrder: number; latitude: number; longitude: number; pickupAllowed: boolean; dropAllowed: boolean }
  ) => api.post<StopDto>(`/admin/routes/${routeId}/stops`, data).then((r) => r.data),
  updateStop: (
    stopId: number,
    data: { name: string; sequenceOrder: number; latitude: number; longitude: number; pickupAllowed: boolean; dropAllowed: boolean }
  ) => api.put<StopDto>(`/admin/stops/${stopId}`, data).then((r) => r.data),
  deleteStop: (stopId: number) =>
    api.delete(`/admin/stops/${stopId}`).then((r) => r.data),

  getSchedules: () => api.get<ScheduleSearchResult[]>("/schedules/all").then((r) => r.data),
  publishSchedule: (data: { busId: number; routeId: number; departureTime: string; arrivalTime: string }) =>
    api.post("/schedules/manage", data).then((r) => r.data),
  updateSchedule: (id: number, data: { busId: number; routeId: number; departureTime: string; arrivalTime: string }) =>
    api.put(`/schedules/manage/${id}`, data).then((r) => r.data),
  deleteSchedule: (id: number) => api.delete(`/schedules/manage/${id}`).then((r) => r.data),


  getUsers: () => api.get<UserEntry[]>("/admin/users").then((r) => r.data),
  createStaff: (data: { name: string; email: string; phone: string; password: string; role: string }) =>
    api.post<AuthResponse>("/auth/staff", data).then((r) => r.data),
  toggleUserActive: (id: number) => api.patch<UserEntry>(`/admin/users/${id}/toggle-active`).then((r) => r.data),
  updateUserRole: (id: number, role: string) =>
    api.patch<UserEntry>(`/admin/users/${id}/role`, null, { params: { role } }).then((r) => r.data),

  auditLog: () => api.get<AuditLogEntry[]>("/admin/audit-log").then((r) => r.data),
};

export interface UserProfileDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  preferredLanguage: string;
  active: boolean;
  createdAt: string;
  totalBookings: number;
}

export const UserApi = {
  getProfile: () => api.get<UserProfileDto>("/users/me").then((r) => r.data),
  updateProfile: (data: { name: string; phone?: string; preferredLanguage?: string }) =>
    api.put<UserProfileDto>("/users/me", data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/users/me/change-password", data).then((r) => r.data),
  deactivateAccount: () => api.delete("/users/me").then((r) => r.data),
};



export const BookingApi = {
  create: (data: {
    scheduleId: number;
    seatIds: number[];
    pickupStopId: number;
    dropStopId: number;
    travelDate: string;
  }) => api.post<BookingGroupResponse>("/bookings", data).then((r) => r.data),
  mine: () => api.get("/bookings/mine").then((r) => r.data),
  cancel: (id: number) => api.delete(`/bookings/${id}`).then((r) => r.data),
  joinWaitingList: (scheduleId: number) =>
    api.post(`/bookings/waiting-list/${scheduleId}`).then((r) => r.data),
};

export interface PaymentEntry {
  id: number;
  amount: number;
  method: string;
  status: string;
  transactionRef: string;
  flaggedDuplicate: boolean;
  refundReason: string | null;
  refundedAt: string | null;
  createdAt: string;
  booking: { id: number; ticketReference: string; status: string };
}

export interface NotificationEntry {
  id: number;
  type: string;
  channel: string;
  message: string;
  deliveryStatus: string;
  sentAt: string;
  bookingId?: number | null;
  user?: { id: number; name: string; email: string; phone: string } | null;
}

export interface CardPaymentDetails {
  paymentMethod: "CARD";
  groupRef: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface WalletPaymentDetails {
  paymentMethod: "WALLET";
  groupRef: string;
  walletPhone: string;
  walletPin: string;
}

export const PaymentApi = {
  checkout: (details: CardPaymentDetails | WalletPaymentDetails) =>
    api.post<BookingGroupResponse>("/payments/checkout", details).then((r) => r.data),
  all: () => api.get<PaymentEntry[]>("/payments").then((r) => r.data),
  refund: (paymentId: number, approved: boolean, reason: string) =>
    api.patch<PaymentEntry>(`/payments/${paymentId}/refund`, { approved, reason }).then((r) => r.data),
  void: (paymentId: number) =>
    api.delete(`/payments/${paymentId}`).then((r) => r.data),
  reconcile: (transactionRef: string) =>
    api.get<PaymentEntry>(`/payments/reconcile/${transactionRef}`).then((r) => r.data),
};

export const SupportApi = {
  lookupBooking: (ticketReference: string) =>
    api.get(`/support/bookings/lookup`, { params: { ticketReference } }).then((r) => r.data),
  resendNotification: (id: number) =>
    api.post<NotificationEntry>(`/support/notifications/${id}/resend`).then((r) => r.data),
  getAllNotifications: () =>
    api.get<NotificationEntry[]>("/support/notifications").then((r) => r.data),
  retryNotification: (id: number, channel?: string) =>
    api.post<NotificationEntry>(`/support/notifications/${id}/retry`, null, {
      params: channel ? { channel } : {},
    }).then((r) => r.data),
  broadcastAlert: (scheduleId: number, message: string, channel?: string) =>
    api.post<{ success: boolean; notifiedCount: number; message: string }>("/support/notifications/broadcast", null, {
      params: { scheduleId, message, ...(channel ? { channel } : {}) },
    }).then((r) => r.data),
  deleteNotification: (id: number) =>
    api.delete(`/support/notifications/${id}`).then((r) => r.data),
};

export interface FleetTrackingDto {
  scheduleId: number;
  busPlateNumber: string;
  busType: string;
  driverName: string;
  routeName: string;
  status: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  etaToArrival: string | null;
  distanceRemainingKm: number;
  progressPercent: number;
  totalGpsLogs: number;
  archived: boolean;
}

export const TrackingApi = {
  getPosition: (scheduleId: number) =>
    api.get<GpsPositionDto>(`/tracking/${scheduleId}`).then((r) => r.data),
  getMyPosition: (scheduleId: number) =>
    api.get<GpsPositionDto>(`/tracking/${scheduleId}/mine`).then((r) => r.data),
  getFleetOverview: () =>
    api.get<FleetTrackingDto[]>("/tracking/fleet").then((r) => r.data),
  sendGpsPing: (scheduleId: number, data: { latitude: number; longitude: number; speedKmH?: number }) =>
    api.post<GpsPositionDto>(`/tracking/${scheduleId}/ping`, data).then((r) => r.data),
  archiveGpsLogs: (scheduleId: number) =>
    api.post<{ success: boolean; archivedCount: number }>(`/tracking/schedules/${scheduleId}/archive`).then((r) => r.data),
  purgeGpsLogs: (scheduleId: number) =>
    api.delete<{ success: boolean; purgedCount: number }>(`/tracking/schedules/${scheduleId}/logs`).then((r) => r.data),
};

export interface DriverScheduleEntry {
  scheduleId: number;
  busPlateNumber: string;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  passengerCount: number;
}

export interface ManifestEntry {
  passengerName: string;
  seatNumber: string;
  pickupStopName: string;
  dropStopName: string;
  status: string;
}

export const NotificationApi = {
  mine: () => api.get<NotificationEntry[]>("/notifications/mine").then((r) => r.data),
  delete: (id: number) => api.delete(`/notifications/${id}`).then((r) => r.data),
};


export interface ReviewDto {
  id: number;
  passengerName: string;
  rating: number;
  comment: string;
}

export interface AdminStats {
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  activeBuses: number;
  unavailableBuses: number;
  totalRoutes: number;
  totalPassengers: number;
  bookingsByStatus: Record<string, number>;
  paymentsByStatus: Record<string, number>;
  revenueByRoute: Record<string, number>;
}

export const ReviewApi = {
  submit: (bookingId: number, rating: number, comment: string) =>
    api.post<ReviewDto>("/reviews", { bookingId, rating, comment }).then((r) => r.data),
  routeRating: (routeId: number) =>
    api.get<{ averageRating: number; reviewCount: number }>(`/reviews/route/${routeId}/rating`).then((r) => r.data),
  routeReviews: (routeId: number) =>
    api.get<ReviewDto[]>(`/reviews/route/${routeId}`).then((r) => r.data),
};

export const AdminStatsApi = {
  get: () => api.get<AdminStats>("/admin/stats").then((r) => r.data),
};

export const DriverApi = {
  todaysSchedules: () => api.get<DriverScheduleEntry[]>("/driver/schedules").then((r) => r.data),
  manifest: (scheduleId: number) =>
    api.get<ManifestEntry[]>(`/driver/schedules/${scheduleId}/manifest`).then((r) => r.data),
};
