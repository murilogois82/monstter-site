import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Database, LayoutGrid, Server, Settings, Users } from "lucide-react";
import { Link } from "wouter";

export default function Services() {
  const services = [
    {
      id: "advpl",
      icon: <Code className="w-8 h-8" />,
      title: "Fábrica de Software ADVPL",
      description: "Desenvolvimento de rotinas customizadas, relatórios complexos, pontos de entrada e integrações via Web Services (REST/SOAP). Transformamos requisitos de negócio em código limpo e performático.",
      features: ["Customizações Protheus", "Integrações via API", "Portais Web", "Apps Mobile integrados"]
    },
    {
      id: "db",
      icon: <Database className="w-8 h-8" />,
      title: "Gestão de Banco de Dados",
      description: "Administração especializada de bancos SQL Server e Oracle para ambientes TOTVS. Garantimos a integridade, segurança e velocidade dos seus dados.",
      features: ["Tuning de Queries", "Migração de Versão", "Backup & Recovery", "Monitoramento 24/7"]
    },
    {
      id: "infra",
      icon: <Server className="w-8 h-8" />,
      title: "Infraestrutura TOTVS",
      description: "Arquitetura e sustentação do ambiente tecnológico. Instalação, configuração e atualização de binários, aplicação de patches e gestão de servidores de aplicação.",
      features: ["Atualização de Release", "Migração para Cloud", "Alta Disponibilidade", "Segurança da Informação"]
    },
    {
      id: "consulting",
      icon: <LayoutGrid className="w-8 h-8" />,
      title: "Consultoria Funcional",
      description: "Especialistas nos módulos de Backoffice, RH, Manufatura e Logística. Apoiamos na implantação, parametrização e revisão de processos para aderência ao standard.",
      features: ["Implantação de Módulos", "Revitalização de Processos", "Treinamento de Usuários", "Documentação Técnica"]
    },
    {
      id: "outsourcing",
      icon: <Users className="w-8 h-8" />,
      title: "Outsourcing de TI",
      description: "Alocação de profissionais qualificados para atuar dentro da sua estrutura. Flexibilidade para escalar seu time conforme a demanda do projeto.",
      features: ["Desenvolvedores ADVPL", "Analistas Funcionais", "DBAs", "Gerentes de Projeto"]
    },
    {
      id: "audit",
      icon: <Settings className="w-8 h-8" />,
      title: "Auditoria e Diagnóstico",
      description: "Análise profunda do seu ambiente TOTVS para identificar gargalos de performance, falhas de segurança e oportunidades de melhoria no uso do sistema.",
      features: ["Code Review", "Análise de Performance", "Auditoria de Acessos", "Plano de Melhorias"]
    }
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-black border-b border-white/10">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">
            Soluções <span className="text-primary">End-to-End</span>
          </h1>
          <p className="text-xl text-gray-400">
            Do código à infraestrutura, cobrimos todas as camadas do seu ecossistema TOTVS com excelência técnica.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="bg-[#151515] border-white/5 hover:border-primary/50 transition-all duration-300 group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  {service.icon}
                </div>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/service-tech.jpg')] bg-cover bg-center opacity-5" />
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">Como Trabalhamos</h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Imersão", text: "Entendemos seu negócio, dores e objetivos antes de propor qualquer solução." },
                  { step: "02", title: "Planejamento", text: "Desenhamos a arquitetura e o cronograma detalhado do projeto." },
                  { step: "03", title: "Execução Ágil", text: "Entregas incrementais com validação constante para garantir alinhamento." },
                  { step: "04", title: "Sustentação", text: "Monitoramento e suporte pós-implantação para garantir estabilidade." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <div className="text-4xl font-bold text-white/10 font-heading">{item.step}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black p-8 border border-white/10 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-6">Precisa de uma solução personalizada?</h3>
              <p className="text-gray-400 mb-8">
                Cada empresa tem desafios únicos. Nossa equipe está pronta para desenhar um projeto sob medida para você.
              </p>
              <Link href="/contato">
                <Button className="w-full bg-primary hover:bg-red-700 text-white font-bold py-6 text-lg rounded-none">
                  Falar com Consultor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
