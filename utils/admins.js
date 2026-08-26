// Is list me aap kitne bhi Admin Mobile Numbers daal sakte hain
export const ADMIN_MOBILE_NUMBERS = [
  "9937606890", // Aapka Mobile Number
  "9988776655", // Dusra Admin Mobile Number
  "9123456789", // Teesra Admin Mobile Number
];

// Yeh function check karega ki input number Admin hai ya nahi
export function isUserAdmin(mobile) {
  if (!mobile) return false;
  
  // Extra spaces ya formatting hata kar check karega
  const cleanMobile = mobile.toString().trim();
  return ADMIN_MOBILE_NUMBERS.includes(cleanMobile);
}
