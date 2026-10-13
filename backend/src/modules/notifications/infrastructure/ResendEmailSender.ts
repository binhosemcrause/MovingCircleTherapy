import type { EmailMessage, IEmailSender } from '../domain/IEmailSender';

const RESEND_URL = 'https://api.resend.com/emails';

export class ResendEmailSender implements IEmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: [message.to], subject: message.subject, text: message.text }),
    });
    if (!response.ok) {
      throw new Error(`Resend rejected the email (${response.status}): ${await response.text()}`);
    }
  }
}
