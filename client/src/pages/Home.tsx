import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Code2, Database, Laptop, Server, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg.jpg" 
            alt="Background Tecnológico" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.1)_0%,transparent_70%)]" />
        </div>

        <div className="container relative z-10 pt-20">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Especialistas em TOTVS
            </div>
            
            <h1 className="font-heading font-extrabold text-5xl md:text-7xl tracking-tighter text-white leading-tight">
              Tecnologia que <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 text-glow">
                Impulsiona Resultados
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
              Consultoria técnica de elite para sistemas TOTVS. Transformamos complexidade em eficiência com uma equipe sênior focada no seu negócio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/contato">
                <Button size="lg" className="bg-primary hover:bg-red-700 text-white font-bold px-8 py-6 text-lg rounded-none border border-transparent hover:border-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all duration-300 group">
                  Solicitar Consultoria
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/servicos">
                <Button variant="outline" size="lg" className="bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 font-semibold px-8 py-6 text-lg rounded-none backdrop-blur-sm transition-all duration-300">
                  Nossos Serviços
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <div className="w-6 h-10 rounded-full border-2 border-current flex justify-center pt-2">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Anos de Experiência", value: "15+" },
              { label: "Projetos Entregues", value: "200+" },
              { label: "Clientes Satisfeitos", value: "100%" },
              { label: "Disponibilidade", value: "24/7" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-900/5 to-transparent pointer-events-none" />
        
        <div className="container mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500 to-red-900 rounded-lg opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
            <img 
              src="/images/consulting-team.jpg" 
              alt="Equipe Monstter" 
              className="relative rounded-lg shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute -bottom-6 -right-6 bg-black p-6 border border-red-500/30 shadow-xl max-w-xs hidden md:block">
              <p className="text-white font-heading font-bold text-lg">"Excelência técnica é o nosso padrão mínimo."</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-red-500 font-bold tracking-widest uppercase text-sm">Sobre Nós</h2>
              <h3 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                Consultoria Técnica de <br/>Alto Nível
              </h3>
            </div>
            
            <p className="text-gray-400 text-lg leading-relaxed">
              A Monstter Consultoria e Tecnologia nasceu para preencher uma lacuna crítica no mercado: a necessidade de especialistas que realmente dominam a profundidade técnica dos sistemas TOTVS.
            </p>
            
            <p className="text-gray-400 text-lg leading-relaxed">
              Nossa equipe é formada exclusivamente por profissionais seniores, com ampla experiência tanto em tecnologia quanto em regras de negócio. Não entregamos apenas código; entregamos soluções que funcionam.
            </p>
            
            <ul className="space-y-4 pt-4">
              {[
                "Especialistas certificados em Protheus e RM",
                "Foco em performance e escalabilidade",
                "Metodologia ágil e transparente",
                "Suporte técnico dedicado"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <Link href="/sobre">
                <Button variant="link" className="text-white hover:text-red-500 p-0 text-lg font-bold group">
                  Conheça nossa história <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-[#151515] relative">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-red-500 font-bold tracking-widest uppercase text-sm">Nossas Soluções</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-white">O que fazemos de melhor</h3>
            <p className="text-gray-400 text-lg">
              Serviços especializados para maximizar o potencial do seu ERP TOTVS.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code2 className="w-10 h-10 text-red-500" />,
                title: "Desenvolvimento ADVPL",
                desc: "Customizações avançadas, rotinas específicas e integrações sob medida para o seu negócio."
              },
              {
                icon: <Database className="w-10 h-10 text-red-500" />,
                title: "Banco de Dados",
                desc: "Otimização de queries, migração de dados e tuning de performance para SQL Server e Oracle."
              },
              {
                icon: <Server className="w-10 h-10 text-red-500" />,
                title: "Infraestrutura",
                desc: "Instalação, atualização de release e configuração de ambientes de alta disponibilidade."
              },
              {
                icon: <Laptop className="w-10 h-10 text-red-500" />,
                title: "Consultoria Funcional",
                desc: "Mapeamento de processos e implantação de módulos com foco nas melhores práticas."
              },
              {
                icon: <Users className="w-10 h-10 text-red-500" />,
                title: "Alocação de Profissionais",
                desc: "Body shop de especialistas para reforçar sua equipe interna em projetos críticos."
              },
              {
                icon: <CheckCircle2 className="w-10 h-10 text-red-500" />,
                title: "Auditoria de Sistemas",
                desc: "Análise completa do ambiente para identificar gargalos e riscos de segurança."
              }
            ].map((service, index) => (
              <Card key={index} className="bg-[#1A1A1A] border-white/5 hover:border-red-500/50 transition-all duration-300 group hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg group-hover:bg-red-500/10 transition-colors">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 leading-relaxed">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/servicos">
              <Button className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-none">
                Ver todos os serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/totvs-integration.jpg" 
            alt="Background Tech" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              Pronto para elevar o nível <br/>da sua operação?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl">
              Não deixe que limitações técnicas freiem o crescimento da sua empresa. Fale com quem entende do assunto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contato">
                <Button size="lg" className="bg-primary hover:bg-red-700 text-white font-bold px-10 py-8 text-xl rounded-none shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:shadow-[0_0_50px_rgba(255,0,0,0.6)] transition-all duration-300">
                  Falar com um Especialista
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
