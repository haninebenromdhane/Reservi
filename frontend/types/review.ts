export type Review = {
  _id: string;
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  professional: {
    _id: string;
    displayName: string;
  };
  booking: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
};