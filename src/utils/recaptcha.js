import axios from "axios";

export async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("⚠️ RECAPTCHA_SECRET_KEY missing; registration will reject for safety.");
    return false;
  }

  try {
    const res = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({ secret, response: token }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return Boolean(res.data?.success);
  } catch (e) {
    console.warn("reCAPTCHA verify failed:", e?.message);
    return false;
  }
}
