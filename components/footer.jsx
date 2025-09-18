import { Card } from "@/components/ui/card"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-card/50 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo and tagline */}
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-bold text-primary mb-2">OperixML</h4>
            <p className="text-sm text-muted-foreground">El futuro de la gestión empresarial</p>
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-4">
            <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <Card className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Card>
            </a>
            <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <Card className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Card>
            </a>
            <a href="#" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <Card className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Card>
            </a>
            <a href="mailto:contacto@operixml.com" aria-label="Email: contacto@operixml.com">
              <Card className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Mail className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Card>
            </a>
          </div>

          {/* Legal links */}
          <div className="text-center md:text-right space-y-2">
            <div className="space-x-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Términos
              </a>
            </div>
            <p className="text-xs text-muted-foreground">© 2024 OperixML. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
