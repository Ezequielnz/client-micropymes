"use client"

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

export function RecaptchaProvider({ children }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[reCAPTCHA] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined. Forms will submit without reCAPTCHA.")
    }
    return children
  }
  return <GoogleReCaptchaProvider reCaptchaKey={siteKey}>{children}</GoogleReCaptchaProvider>
}
