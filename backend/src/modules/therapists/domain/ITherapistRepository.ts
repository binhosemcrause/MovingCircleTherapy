import type { Therapist } from './Therapist';

export interface CreateTherapistInput {
  firstName: string;
  lastName: string;
  title: string;
  bio?: string;
  specialties?: string[];
  photoUrl?: string;
  // Stored for notifying the therapist; never returned by the API.
  email?: string;
  isActive?: boolean;
  position?: number;
}

export type UpdateTherapistInput = Partial<CreateTherapistInput>;

export interface ITherapistRepository {
  findAll(options: { includeInactive: boolean }): Promise<Therapist[]>;
  findById(id: string): Promise<Therapist | null>;
  create(input: CreateTherapistInput): Promise<Therapist>;
  update(id: string, input: UpdateTherapistInput): Promise<Therapist | null>;
  delete(id: string): Promise<boolean>;
  hasUpcomingAppointments(id: string): Promise<boolean>;
  // Ties the therapist to the account they sign in with; the email is also
  // where their booking notifications are sent.
  linkUser(id: string, userId: string, email: string): Promise<void>;
}
