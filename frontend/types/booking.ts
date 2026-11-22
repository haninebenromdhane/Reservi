export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type Booking = {
  _id: string;
  client: string | UserSummary;
  professional:
    | string
    | ProfessionalSummary;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  clientNote?: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type UserSummary = {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

export type ProfessionalSummary = {
  _id: string;
  displayName: string;
  city: string;
  imageUrl?: string;
  rating: number;
  reviews: number;
  profession?: {
    _id: string;
    name: string;
  };
};