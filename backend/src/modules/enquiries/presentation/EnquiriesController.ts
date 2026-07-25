import type { Request, Response } from 'express';
import type { SubmitEnquiryUseCase } from '../application/SubmitEnquiryUseCase';

export class EnquiriesController {
  constructor(private readonly submitEnquiryUseCase: SubmitEnquiryUseCase) {}

  submit = async (req: Request, res: Response): Promise<void> => {
    const enquiry = await this.submitEnquiryUseCase.execute(req.body);
    res.status(201).json({
      id: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      subject: enquiry.subject,
      message: enquiry.message,
      createdAt: enquiry.createdAt.toISOString(),
    });
  };
}
