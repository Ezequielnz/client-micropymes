"use client"

import { useForm, ValidationError } from "@formspree/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function HeroSection() {
  const [state, handleSubmit] = useForm("xyzdqrow")

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
          {state.succeeded ? (
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-green-700">¡Gracias por unirte!</p>
              <p className="text-sm text-gray-600">Te avisaremos apenas lancemos.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="form_name" value="hero_section" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="text-center text-lg py-3 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20"
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} />
              <Button
                type="submit"
                size="lg"
                disabled={state.submitting}
                className="w-full text-lg py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 text-white"
              >
                Quiero ser el primero en enterarme
              </Button>
            </form>
          )}
        </Card>

        {/* Trust indicator */}
        <p className="text-sm text-gray-500">🔒 Tus datos están seguros. Sin spam, solo actualizaciones importantes.</p>
      </div>
    </section>
  )
}

