export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  location: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  // Set when this account belongs to one of the practice's therapists.
  therapistId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  therapistId: string | null;
  createdAt: string;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    location: user.location,
    tagline: user.tagline,
    avatarUrl: user.avatarUrl,
    therapistId: user.therapistId,
    createdAt: user.createdAt.toISOString(),
  };
}
