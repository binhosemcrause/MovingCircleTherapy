import type { User } from './User';

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  tagline?: string;
  avatarUrl?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
}
