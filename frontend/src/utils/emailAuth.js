import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'service_4srslsy';
const TEMPLATE_ID = 'template_mjgni5h';
const PUBLIC_KEY  = '6wW-SAMjdXaslVg_P';

/**
 * Generates a random 6-digit OTP code.
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends a verification OTP to the given email via EmailJS.
 * @param {string} toEmail  - Recipient email address
 * @param {string} toName   - Recipient display name
 * @param {string} otp      - The 6-digit code to send
 * @returns {Promise}
 */
export async function sendVerificationEmail(toEmail, toName, otp) {
  const templateParams = {
    to_email:          toEmail,
    to_name:           toName || 'there',
    verification_code: otp,
    otp:               otp,   // include both so either template variable works
    message:           `Your VentureScope verification code is: ${otp}`,
  };

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}
