import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Início", path: "/" },
    { label: "Sobre", path: "/sobre" },
    { label: "Serviços", path: "/servicos" },
    { label: "Contato", path: "/contato" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      {/* Top Bar */}
      <div className="bg-black py-2 border-b border-white/10 text-xs text-gray-400 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-3 h-3" /> (14) 98103-0777
            </span>
            <span className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-3 h-3" /> consultoria@monstter.com.br
            </span>
          </div>
          <div className="flex items-center gap-2 hover:text-primary transition-colors">
            <MapPin className="w-3 h-3" /> Itapuí-SP
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 font-heading font-bold text-2xl tracking-tighter hover:opacity-90 transition-opacity cursor-pointer">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-black text-white overflow-hidden">
                <span className="text-xs font-bold">M</span>
              </div>
              <span>
                Mons<span className="text-primary">TT</span>er
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative group cursor-pointer",
                    location === item.path ? "text-primary" : "text-gray-300"
                  )}
                >
                  {item.label}
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                    location === item.path ? "w-full" : ""
                  )} />
                </div>
              </Link>
            ))}
            <Link href="/contato">
              <Button variant="default" className="bg-primary hover:bg-red-700 text-white font-bold rounded-none px-6 border border-transparent hover:border-red-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all duration-300">
                Fale Conosco
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-background">
            <div className="container py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary p-2 block cursor-pointer",
                      location === item.path ? "text-primary bg-white/5" : "text-gray-300"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
              <Link href="/contato">
                <Button className="w-full bg-primary hover:bg-red-700 text-white font-bold rounded-none mt-2">
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 text-gray-400 text-sm">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-heading font-bold text-xl text-white">
              <span>Mons<span className="text-primary">TT</span>er</span>
            </div>
            <p className="leading-relaxed max-w-xs">
              Consultoria técnica especializada em sistemas TOTVS. Soluções robustas para o seu negócio.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-white mb-4 uppercase tracking-wider text-xs">Navegação</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <span className="hover:text-primary transition-colors cursor-pointer">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-white mb-4 uppercase tracking-wider text-xs">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> (14) 98103-0777
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> consultoria@monstter.com.br
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-1" /> 
                <span>Rua Candido Ferreira Dias, 90<br/>Centro, Itapuí-SP</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-white mb-4 uppercase tracking-wider text-xs">Legal</h3>
            <p>CNPJ: 30.827.651/0001-10</p>
            <p className="mt-4 text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Monstter Consultoria e Tecnologia. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
