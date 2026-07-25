import type { CreateEnquiryInput, IEnquiryRepository } from '../domain/IEnquiryRepository';
import type { Enquiry } from '../domain/Enquiry';

export class SubmitEnquiryUseCase {
  constructor(private readonly enquiryRepository: IEnquiryRepository) {}

  async execute(input: CreateEnquiryInput): Promise<Enquiry> {
    return this.enquiryRepository.create(input);
  }
}
