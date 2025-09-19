"use client"

import { useRef, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Sparkles } from "lucide-react"

export function SecondCTASection() {
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
    console.log("[Second CTA] executeRecaptcha available:", !!executeRecaptcha)
    try {
      let token = ""
      if (!executeRecaptcha) {
        setCaptchaError("reCAPTCHA no está listo. Espera un momento e intenta nuevamente.")
        setVerifying(false)
        return
      }
      try {
        const rawToken = await executeRecaptcha("second_cta")
        if (!rawToken) {
          setCaptchaError("Error generando token de reCAPTCHA. Intenta nuevamente.")
          setVerifying(false)
          return
        }
        token = rawToken
        // eslint-disable-next-line no-console
        console.log("[Second CTA] raw token:", rawToken, "final token:", token)
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
      console.log("[Second CTA] Formspree response:", resp.status, data)
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
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-border/50">
          <CardContent className="p-12">
            <div className="space-y-8">
              {/* Icon and heading */}
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-balance">
                  No te pierdas el lanzamiento de <span className="text-primary">OperixML</span>
                </h3>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                  Sé de los primeros en acceder a la plataforma que revolucionará la gestión de tu PyME
                </p>
              </div>

              {/* Benefits list */}
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Acceso anticipado</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Descuento especial</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Soporte prioritario</span>
                </div>
              </div>

              {/* Email form */}
              <div className="max-w-md mx-auto">
                {succeeded ? (
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-green-700">¡Gracias! Te avisaremos del lanzamiento.</p>
                    <p className="text-sm text-muted-foreground">Revisa tu correo por una confirmación.</p>
                  </div>
                ) : (
                  <form onSubmit={preSubmit} className="space-y-4">
                    <input type="hidden" name="form_name" value="second_cta" />
                    <input ref={tokenRef} type="hidden" name="g-recaptcha-response" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Ingresa tu email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-center text-lg py-3"
                    />
                    {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}
                    {captchaError ? (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">{captchaError}</p>
                    ) : null}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || verifying}
                      className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 transform hover:scale-105"
                    >
                      {submitting || verifying ? "Enviando..." : "Notificarme del lanzamiento"}
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
              </div>

              <p className="text-xs text-muted-foreground">
                Al suscribirte, aceptas recibir actualizaciones sobre OperixML. Puedes cancelar en cualquier momento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

