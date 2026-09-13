export type Role = "CUSTOMER" | "OWNER" | "EMPLOYEE" | "ADMIN";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiListSuccess<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export type ApiListResponse<T> = ApiListSuccess<T> | ApiError;

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginResponse extends AuthTokensDTO {
  user: UserDTO;
}

export interface BusinessDTO {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  category: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessListQuery {
  category?: string;
  search?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface BusinessHoursEntryDTO {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
}

export interface ProfessionalBlockDTO {
  id: string;
  professionalId: string;
  startAt: string;
  endAt: string;
  reason: string | null;
}

export interface AvailabilityQuery {
  businessId: string;
  professionalId: string;
  serviceId: string;
  date: string;
}

export interface AvailabilitySlotDTO {
  time: string;
}

export interface ServiceDTO {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalDTO {
  id: string;
  businessId: string;
  userId: string;
  name: string;
  bio: string | null;
  specialty: string | null;
  imageUrl: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDTO {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  visits: number;
  totalSpent: number;
  lastVisit: string | null;
  status: "active" | "vip" | "inactive";
}

export interface AppointmentDTO {
  id: string;
  businessId: string;
  clientId: string;
  serviceId: string;
  professionalId: string;
  scheduledAt: string;
  price: number;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  businessId: string;
  serviceId: string;
  professionalId: string;
  scheduledAt: string;
  notes?: string;
}

export interface FavoriteDTO {
  id: string;
  businessId: string;
  business: BusinessDTO;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
