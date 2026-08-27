// lib/admin.js

// ================================
// ADMIN MOBILE NUMBERS
// ================================

export const ADMIN_MOBILE_NUMBERS = [
  "9937606890",
  "9988776655",
  "9123456789",
];

// ================================
// NORMALIZE MOBILE NUMBER
// ================================

export function normalizeAdminMobile(mobile) {
  if (!mobile) return "";

  return String(mobile)
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .replace(/^0+/, "");
}

// ================================
// CHECK ADMIN
// ================================

export function isUserAdmin(mobile) {
  const cleanMobile = normalizeAdminMobile(mobile);

  if (!cleanMobile) {
    return false;
  }

  return ADMIN_MOBILE_NUMBERS.includes(cleanMobile);
}
