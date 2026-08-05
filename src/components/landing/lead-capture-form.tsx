import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Reveal } from "@/components/landing/reveal";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  subject: z.string().min(5, "O assunto deve ser mais descritivo"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export function LeadCaptureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // Simulação de envio para um endpoint de captura de leads
      console.log("Lead captured:", values);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      form.reset();
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-8 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Mensagem Recebida!</h3>
        <p className="text-muted-foreground max-w-sm">
          Obrigado pelo interesse. Nossa equipe analisará sua solicitação e entrará em contato pelo e-mail fornecido em até 24 horas.
        </p>
        <Button 
          variant="outline" 
          className="mt-8 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
          onClick={() => setIsSuccess(false)}
        >
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70 text-xs uppercase tracking-widest font-bold">Nome</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Seu nome completo" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus:border-emerald-500/50" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-[10px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70 text-xs uppercase tracking-widest font-bold">E-mail</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="exemplo@email.com" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus:border-emerald-500/50" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/70 text-xs uppercase tracking-widest font-bold">Assunto</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Como podemos ajudar?" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus:border-emerald-500/50" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400 text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/70 text-xs uppercase tracking-widest font-bold">Mensagem</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva sua dúvida ou solicitação..." 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[120px] rounded-xl focus:border-emerald-500/50 resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400 text-[10px]" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-emerald-500 text-[#0A1512] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 shadow-[0_20px_40px_-10px_rgba(31,174,109,0.3)] transition-all active:scale-95 mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Enviar Solicitação
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
