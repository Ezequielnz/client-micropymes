import { Card, CardContent } from "@/components/ui/card"
import { Users, Star, TrendingUp } from "lucide-react"

export function SocialProofSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-balance text-gray-900">
            Únete a los primeros en transformar su negocio con{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">OperixML</span>
          </h3>
          <p className="text-lg text-gray-600 text-pretty">
            Sé parte de la revolución en gestión empresarial para pymes
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-6 mb-12">
          {/*<Card className="bg-white/50 backdrop-blur-sm border-gray-100">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <p className="text-sm text-gray-500">Empresas en lista de espera</p>
            </CardContent>
          </Card>*/}

          <Card className="bg-white/50 backdrop-blur-sm border-gray-100">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">4.9/5</div>
              <p className="text-sm text-gray-500">Calificación en beta testing</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-gray-100">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">85%</div>
              <p className="text-sm text-gray-500">Mejora en eficiencia reportada</p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for future testimonials */}
        <div className="bg-gray-50/50 rounded-lg p-8 border border-gray-100">
          <p className="text-gray-500 italic">
            "Próximamente: testimonios de empresas que ya están transformando su gestión con OperixML"
          </p>
        </div>
      </div>
    </section>
  )
}
