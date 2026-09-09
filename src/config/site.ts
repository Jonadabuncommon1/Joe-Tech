/**
 * Joe Tech, single source of truth for business details.
 *
 * Everything a non-developer might need to change lives here: phone numbers,
 * addresses, bank account, email. Change it once and it updates site-wide.
 */

export const site = {
  name: 'Joe Tech',
  tagline: 'Your Surest Plug.',
  shortDescription: 'Genuine devices, sourced right, no shady deals.',
  url: 'https://joetech.shop',
  email: 'support@joetech.shop',
} as const;

/** Phone numbers for calls. */
export const contacts = {
  primary: '08133727813',
  secondary: '09071054193',
} as const;

/** Digits only for WhatsApp (08133727813). */
export const whatsappNumber = '2348133727813';

export const branches = [
  {
    id: 'nsukka',
    name: 'Nsukka Branch',
    street: 'Abuja Line, Akuroad Market',
    city: 'Nsukka',
    state: 'Enugu State',
    phone: contacts.primary,
    hours: 'Mon – Sat, 8:00am – 6:00pm',
  },
  {
    id: 'ikeja',
    name: 'Lagos Branch',
    street: 'Pepple Street',
    city: 'Ikeja',
    state: 'Lagos State',
    phone: contacts.secondary,
    hours: 'Mon – Sat, 8:00am – 6:00pm',
  },
] as const;

/** Bank transfer details shown on the checkout page. */
export const bankDetails = {
  bankName: 'Access Bank',
  accountName: 'Ikechukwu Jonadab-Christopher Onyiro',
  accountNumber: '1434165682',
  /** Shown under the account details as a reminder to the customer. */
  note: 'Use your order reference as the transfer narration, then send the receipt on WhatsApp to confirm.',
} as const;

/** Guards the checkout against shipping placeholder account details. */
const PLACEHOLDER_ACCOUNT_NUMBER: string = '0000000000';
export const bankDetailsConfigured =
  /^\d{10}$/.test(bankDetails.accountNumber) &&
  bankDetails.accountNumber !== PLACEHOLDER_ACCOUNT_NUMBER;

export const social = {
  whatsapp: `https://wa.me/${whatsappNumber}`,
} as const;

/** Builds a wa.me link with a pre-filled message (always targeting WhatsApp 08133727813). */
export const waLink = (message: string, _number?: string) =>
  `https://wa.me/2348133727813?text=${encodeURIComponent(message)}`;

/** Builds a mailto link with subject and body. */
export const mailLink = (subject: string, body: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
