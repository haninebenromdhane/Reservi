export type UserRole =
  | "CLIENT"
  | "AGENT"
  | "ADMIN";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type Profession = {
  _id: string;
  name: string;
  active: boolean;
};

export type Professional = {
  _id: string;
  user: string;
  profession: Profession | string;
  displayName: string;
  city: string;
  address?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
  rating: number;
  reviews: number;
};

export type Schedule = {
  _id: string;
  professional: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export type TimeOff = {
  _id: string;
  professional: string;
  startDate: string;
  endDate: string;
  reason?: string;
  active: boolean;
};

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type Booking = {
  _id: string;
  client: string | User;
  professional:
    | string
    | Professional;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  clientNote?: string;
  status: BookingStatus;
};

export type Review = {
  _id: string;
  booking: string;
  client: string | User;
  professional:
    | string
    | Professional;
  rating: number;
  comment: string;
  status: "VISIBLE" | "HIDDEN";
  createdAt?: string;
};