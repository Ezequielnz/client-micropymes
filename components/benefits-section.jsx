import { Card, CardContent } from "@/components/ui/card"
import { Bot, Zap, Puzzle, Building2 } from "lucide-react"

const benefits = [
  {
    icon: Bot,
    title: "Automatización Inteligente",
    description: "IA que aprende de tu negocio y automatiza tareas repetitivas para que te enfoques en crecer.",
  },
  {
    icon: Zap,
    title: "Interfaz Simple",
    description: "Diseñado para ser intuitivo desde el primer día. Sin curvas de aprendizaje complicadas.",
  },
  {
    icon: Puzzle,
    title: "Módulos Flexibles",
    description: "Agrega solo lo que necesitas. Crece a tu ritmo con módulos que se adaptan a tu negocio.",
  },
  {
    icon: Building2,
    title: "Hecho para PyMEs",
    description: "Pensado específicamente para pequeñas y medianas empresas. Potente pero accesible.",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-20 px-4 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-balance text-gray-900">
            ¿Por qué elegir{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">OperixML</span>?
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Transformamos la gestión empresarial con tecnología de vanguardia y simplicidad sin precedentes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-gray-100"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                  <benefit.icon className="w-8 h-8 text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold text-balance text-gray-900">{benefit.title}</h4>
                <p className="text-gray-600 text-pretty leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
