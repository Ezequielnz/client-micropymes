import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Brain, Workflow, BarChart3 } from "lucide-react"

export function ProductExplanationSection() {
  return (
    <section className="py-20 px-4 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Explanation */}
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-balance">
              Con <span className="text-primary">OperixML</span>, tus procesos trabajan para vos
            </h3>

            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Gestión simple, alertas inteligentes y una experiencia diseñada para crecer con tu empresa
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Inteligencia Artificial Integrada</h4>
                  <p className="text-muted-foreground text-pretty">
                    Predicciones de inventario, análisis de tendencias y automatización de decisiones rutinarias
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Workflow className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Flujos de Trabajo Automatizados</h4>
                  <p className="text-muted-foreground text-pretty">
                    Desde la facturación hasta el seguimiento de clientes, todo funciona sin intervención manual
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Reportes que Importan</h4>
                  <p className="text-muted-foreground text-pretty">
                    Dashboards intuitivos con métricas clave para tomar decisiones informadas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Visual representation */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Brain className="w-10 h-10 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold">Tu ERP Inteligente</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/80 rounded-lg p-4 text-center">
                      <Workflow className="w-6 h-6 text-accent mx-auto mb-2" />
                      <p className="text-sm font-medium">Automatización</p>
                    </div>
                    <div className="bg-background/80 rounded-lg p-4 text-center">
                      <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Analytics</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>

                  <div className="bg-accent/10 rounded-lg p-4 text-center">
                    <p className="font-semibold text-accent">Crecimiento Empresarial</p>
                    <p className="text-sm text-muted-foreground mt-1">Resultados medibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
