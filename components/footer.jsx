import { Card } from "@/components/ui/card"

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-card/50 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo and tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo 1.png" alt="OperixML Logo" className="h-8 w-8" />
              <h4 className="text-2xl font-bold text-black">OperixML</h4>
            </div>
            <p className="text-sm text-muted-foreground">El futuro de la gestión empresarial</p>
          </div>

          {/* Social links */}
          <div className="flex justify-center gap-4">
            <a href="https://instagram.com/operix.ml" aria-label="Instagram @operix.ml" target="_blank" rel="noopener noreferrer">
              <Card className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <img src="/logo_instagram.png" alt="Instagram" className="w-5 h-5" />
              </Card>
            </a>
            <a href="https://linkedin.com/company/operixml" aria-label="LinkedIn OperixML" target="_blank" rel="noopener noreferrer">
              <Card className="w-10 h-10 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <img src="/logo_linkedin.png" alt="LinkedIn" className="w-5 h-5" />
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
            <p className="text-xs text-muted-foreground">© 2025 OperixML. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
