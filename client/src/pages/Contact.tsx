import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export default function Contact() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(data);
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    reset();
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
            <h2 className="text-2xl font-bold text-white mb-6">Envie uma mensagem</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Nome</label>
                  <Input 
                    {...register("name", { required: true })}
                    className="bg-[#2D2D2D] border-transparent focus:border-primary text-white h-12" 
                    placeholder="Seu nome"
                  />
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
                  <label className="text-sm font-medium text-gray-400">E-mail</label>
                  <Input 
                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                    type="email"
                    className="bg-[#2D2D2D] border-transparent focus:border-primary text-white h-12" 
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Telefone</label>
                  <Input 
                    {...register("phone", { required: true })}
                    className="bg-[#2D2D2D] border-transparent focus:border-primary text-white h-12" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Mensagem</label>
                <Textarea 
                  {...register("message", { required: true })}
                  className="bg-[#2D2D2D] border-transparent focus:border-primary text-white min-h-[150px]" 
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-red-700 text-white font-bold py-6 text-lg rounded-none transition-all"
              >
                {isSubmitting ? "Enviando..." : (
                  <>
                    Enviar Mensagem <Send className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>

        </div>
      </section>
    </Layout>
  );
}
