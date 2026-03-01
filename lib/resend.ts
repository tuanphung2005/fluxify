import { Resend } from "resend";

// Lazy-initialize Resend to avoid build-time errors
let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}
