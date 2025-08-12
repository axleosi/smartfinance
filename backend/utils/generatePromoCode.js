// utils/generatePromoCode.js
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function rand4() {
  let s = '';
  for (let i = 0; i < 4; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

// ✅ Only promoCode + promoLink
export async function generatePartnerCodes(UserModel) {
  let promoCode;
  let tries = 0;

  // Find unique promoCode
  while (tries < 50) {
    const code = rand4();
    const exists = await UserModel.findOne({ promoCode: code });
    if (!exists) {
      promoCode = code;
      break;
    }
    tries++;
  }

  // Fallback: 6 chars if 4-char space is exhausted
  if (!promoCode) {
    promoCode = '';
    for (let i = 0; i < 6; i++) {
      promoCode += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  }

  const promoLink = `${process.env.CLIENT_URL || 'https://a.com'}?promo=${promoCode}`;
  return { promoCode, promoLink };
}

