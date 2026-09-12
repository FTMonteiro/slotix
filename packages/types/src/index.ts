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

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDTO {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
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
