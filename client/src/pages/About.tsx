import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <Layout>
      {/* Header Section */}
      <section className="relative py-20 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,0,0,0.15)_0%,transparent_50%)]" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 tracking-tight">
              Nossa <span className="text-primary">Essência</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Mais do que consultores, somos parceiros estratégicos focados em transformar tecnologia em vantagem competitiva.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto grid md:grid-cols-2 gap-16">
          <div className="space-y-8 text-lg text-gray-300 leading-relaxed">
            <p>
              <strong className="text-white">A Monstter Consultoria e Tecnologia</strong> foi fundada com um propósito claro: elevar o padrão de qualidade no mercado de consultoria TOTVS. Percebemos que muitas empresas sofriam com soluções superficiais que não resolviam a raiz dos problemas.
            </p>
            <p>
              Nossa abordagem é diferente. Mergulhamos fundo na arquitetura dos sistemas e nos processos de negócio dos nossos clientes. Não acreditamos em "soluções de prateleira". Cada projeto é tratado como único, exigindo um diagnóstico preciso e uma execução cirúrgica.
            </p>
            <p>
              Sediada em Itapuí-SP, atendemos clientes em todo o território nacional, levando expertise técnica e compromisso com resultados. Nossa equipe é nosso maior ativo, formada exclusivamente por profissionais com anos de estrada e batalhas vencidas no mundo corporativo.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-red-500/20 blur-2xl rounded-full opacity-50" />
            <img 
              src="/images/consulting-team.jpg" 
              alt="Nossa Equipe" 
              className="relative w-full rounded-lg shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#151515] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Pilares da Monstter</h2>
            <p className="text-gray-400">Os princípios inegociáveis que guiam cada linha de código e cada decisão.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-12 h-12 text-primary" />,
                title: "Precisão Técnica",
                desc: "Não aceitamos 'mais ou menos'. Nossas soluções são testadas, validadas e otimizadas para performance máxima."
              },
              {
                icon: <Shield className="w-12 h-12 text-primary" />,
                title: "Confiança Absoluta",
                desc: "Transparência total em prazos, custos e entregáveis. Construímos relacionamentos de longo prazo baseados na verdade."
              },
              {
                icon: <Zap className="w-12 h-12 text-primary" />,
                title: "Agilidade Real",
                desc: "Entendemos a urgência do negócio. Nossa metodologia elimina burocracia para entregar valor mais rápido."
              }
            ].map((value, index) => (
              <div key={index} className="bg-black p-8 border border-white/5 hover:border-primary/50 transition-colors group">
                <div className="mb-6 bg-white/5 w-fit p-4 rounded-full group-hover:bg-primary/10 transition-colors">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">Quer fazer parte dessa história de sucesso?</h2>
          <Link href="/contato">
            <Button size="lg" className="bg-black text-white hover:bg-gray-900 font-bold px-10 py-8 text-lg rounded-none border border-white/20">
              Entre em Contato
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
