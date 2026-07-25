import type { Enquiry } from './Enquiry';

export interface CreateEnquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface IEnquiryRepository {
  create(input: CreateEnquiryInput): Promise<Enquiry>;
}
