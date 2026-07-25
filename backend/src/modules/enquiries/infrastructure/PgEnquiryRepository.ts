import type { Pool } from 'pg';
import type { CreateEnquiryInput, IEnquiryRepository } from '../domain/IEnquiryRepository';
import type { Enquiry } from '../domain/Enquiry';

interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  created_at: Date;
}

function toEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  };
}

export class PgEnquiryRepository implements IEnquiryRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreateEnquiryInput): Promise<Enquiry> {
    const result = await this.pool.query<EnquiryRow>(
      `insert into enquiries (name, email, phone, subject, message)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [input.name, input.email, input.phone ?? null, input.subject ?? null, input.message],
    );
    return toEnquiry(result.rows[0]!);
  }
}
