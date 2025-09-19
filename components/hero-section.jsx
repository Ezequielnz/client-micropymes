"use client"

import { useRef, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function HeroSection() {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const tokenRef = useRef(null)
  const [email, setEmail] = useState("")
  const [captchaError, setCaptchaError] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const preSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setCaptchaError(null)
    setVerifying(true)
    // eslint-disable-next-line no-console
    console.log("[Hero] executeRecaptcha available:", !!executeRecaptcha)
    try {
      let token = ""
      if (!executeRecaptcha) {
        setCaptchaError("reCAPTCHA no está listo. Espera un momento e intenta nuevamente.")
        setVerifying(false)
        return
      }
      try {
        const rawToken = await executeRecaptcha("hero_section")
        if (!rawToken) {
          setCaptchaError("Error generando token de reCAPTCHA. Intenta nuevamente.")
          setVerifying(false)
          return
        }
        token = rawToken
        // eslint-disable-next-line no-console
        console.log("[Hero] raw token:", rawToken, "final token:", token)
        if (tokenRef.current) tokenRef.current.value = token
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[reCAPTCHA] token generation failed", err)
        setCaptchaError("Error generando token de reCAPTCHA. Intenta nuevamente.")
        setVerifying(false)
        return
      }
      // Submit directly to Formspree
      setSubmitting(true)
      const formData = new FormData(e.target)
      formData.set("g-recaptcha-response", token)

      const resp = await fetch("https://formspree.io/f/xyzdqrow", {
        method: "POST",
        body: formData,
      })
      const data = await resp.json().catch(() => null)
      // eslint-disable-next-line no-console
      console.log("[Hero] Formspree response:", resp.status, data)
      if (!resp.ok) {
        let errorMsg = "No se pudo enviar el formulario. Intenta nuevamente."
        if (data?.errors) {
          errorMsg = `Error: ${data.errors.map(err => err.message).join(", ")}`
        }
        setErrorMsg(errorMsg)
        return
      }
      setSucceeded(true)
    } finally {
      setSubmitting(false)
      setVerifying(false)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239CA3AF' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2">
            OperixML
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto rounded-full" />
        </div>

        <div className="space-y-4">
          <h2 className="text-5xl md:text-6xl font-bold text-balance leading-tight text-gray-900">
            La nueva forma de gestionar tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">PyME</span> con{" "}
            <span className="text-orange-500">inteligencia artificial</span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto text-pretty leading-relaxed">
            Un ERP modular, simple y automatizado, hecho para potenciar tu negocio desde el primer día
          </p>
        </div>

        <Card className="max-w-md mx-auto p-6 bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
          {succeeded ? (
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-green-700">¡Gracias por unirte!</p>
              <p className="text-sm text-gray-600">Te avisaremos apenas lancemos.</p>
            </div>
          ) : (
            <form onSubmit={preSubmit} className="space-y-4">
              <input type="hidden" name="form_name" value="hero_section" />
              <input ref={tokenRef} type="hidden" name="g-recaptcha-response" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center text-lg py-3 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20"
              />
              {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}
              {captchaError ? (
                <p className="text-sm text-red-600" role="alert" aria-live="polite">{captchaError}</p>
              ) : null}
              <Button
                type="submit"
                size="lg"
                disabled={submitting || verifying}
                aria-busy={submitting || verifying}
                className="w-full text-lg py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 text-white"
              >
                {submitting || verifying ? "Enviando..." : "Quiero ser el primero en enterarme"}
              </Button>
              <p className="text-[11px] leading-snug text-gray-500 mt-2">
                Este sitio está protegido por reCAPTCHA y se aplican la
                <a className="underline ml-1" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
                y los
                <a className="underline ml-1" href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Términos del Servicio</a>
                de Google.
              </p>
            </form>
          )}
        </Card>

        {/* Trust indicator */}
        <p className="text-sm text-gray-500">🔒 Tus datos están seguros. Sin spam, solo actualizaciones importantes.</p>
      </div>
    </section>
  )
}

