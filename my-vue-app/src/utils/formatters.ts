export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  const cleaned = String(phoneNumber).replace(/\D/g, '');

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  return phoneNumber;
}