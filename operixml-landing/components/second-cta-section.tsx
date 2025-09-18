"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Sparkles } from "lucide-react"

export function SecondCTASection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    console.log("Email submitted:", email)
    setEmail("")
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Ingresa tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-center text-lg py-3"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 transform hover:scale-105"
                  >
                    Notificarme del lanzamiento
                  </Button>
                </form>
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
