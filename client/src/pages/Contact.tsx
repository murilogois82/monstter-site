import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export default function Contact() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();
  
  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      reset();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.");
    },
  });

  const onSubmit = async (data: ContactForm) => {
    await submitMutation.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company || undefined,
      message: data.message,
    });
  };

  return (
    <Layout>
      <section className="py-20 bg-black min-h-[60vh] flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto relative z-10 grid md:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h1 className="text-5xl font-heading font-bold text-white mb-6">Vamos Conversar?</h1>
              <p className="text-xl text-gray-400">
                Estamos prontos para entender seus desafios e propor as melhores soluções técnicas.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="bg-[#151515] border-white/10 hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center gap-6 p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Telefone / WhatsApp</h3>
                    <p className="text-gray-400">(14) 98103-0777</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151515] border-white/10 hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center gap-6 p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">E-mail</h3>
                    <p className="text-gray-400">consultoria@monstter.com.br</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151515] border-white/10 hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center gap-6 p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Endereço</h3>
                    <p className="text-gray-400">
                      Rua Candido Ferreira Dias, 90 – Centro<br/>
                      Itapuí-SP
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#1A1A1A] p-8 md:p-10 rounded-lg border border-white/5 shadow-2xl">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Mensagem Enviada!</h2>
                <p className="text-gray-400 max-w-sm">
                  Recebemos sua mensagem e entraremos em contato em breve. Obrigado pelo interesse!
                </p>
                <Button 
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">Envie uma mensagem</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Nome *</label>
                      <Input 
                        {...register("name", { required: "Nome é obrigatório", minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" } })}
                        className="bg-[#2D2D2D] border-transparent focus:border-primary text-white h-12" 
                        placeholder="Seu nome"
                      />
                      {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Empresa</label>
                      <Input 
                        {...register("company")}
                        className="bg-[#2D2D2D] border-transparent focus:border-primary text-white h-12" 
                        placeholder="Sua empresa"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">E-mail *</label>
                      <Input 
                        {...register("email", { required: "E-mail é obrigatório", pattern: { value: /^\S+@\S+$/i, message: "E-mail inválido" } })}
                        type="email"
                        className="bg-[#2D2D2D] border-transparent focus:border-primary text-white h-12" 
                        placeholder="seu@email.com"
                      />
                      {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Telefone *</label>
                      <Input 
                        {...register("phone", { required: "Telefone é obrigatório", minLength: { value: 10, message: "Telefone inválido" } })}
                        className="bg-[#2D2D2D] border-transparent focus:border-primary text-white h-12" 
                        placeholder="(00) 00000-0000"
                      />
                      {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Mensagem *</label>
                    <Textarea 
                      {...register("message", { required: "Mensagem é obrigatória", minLength: { value: 10, message: "Mensagem deve ter pelo menos 10 caracteres" } })}
                      className="bg-[#2D2D2D] border-transparent focus:border-primary text-white min-h-[150px]" 
                      placeholder="Como podemos ajudar?"
                    />
                    {errors.message && <span className="text-red-500 text-xs">{errors.message.message}</span>}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                    className="w-full bg-primary hover:bg-red-700 text-white font-bold py-6 text-lg rounded-none transition-all"
                  >
                    {submitMutation.isPending ? "Enviando..." : (
                      <>
                        Enviar Mensagem <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>

        </div>
      </section>
    </Layout>
  );
}
