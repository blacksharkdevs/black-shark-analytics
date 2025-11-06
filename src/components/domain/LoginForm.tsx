import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";
import SharkIcon from "@/assets/images/icons/shark-white-bg.png";
import { DotLoader } from "../common/ui/dotLoader";

const loginSchema = z.object({
  username: z.string().min(1, { message: "O nome de usuário é obrigatório" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AnimatedCard = motion(Card);

const shakeVariants = {
  shake: {
    x: [0, -15, 15, -10, 10, -5, 5, 0],
  },
};

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isShake, setIsShake] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data.username, data.password);

    if (!success) {
      // 🚨 ATIVANDO O SHAKE NO ERRO
      setIsShake(true);
      setTimeout(() => setIsShake(false), 900); // Tempo maior para o shake (de acordo com a duration)

      toast({
        title: "Falha no Login",
        description: "Nome de usuário ou senha inválidos.",
        variant: "destructive",
      });
    }
  };

  return (
    <AnimatedCard
      variants={shakeVariants}
      // Animação de entrada inicial e a animação de shake
      animate={isShake ? "shake" : { y: 0, opacity: 1 }}
      initial="initial"
      transition={
        isShake
          ? { type: "tween", duration: 0.8, ease: "easeInOut" }
          : { type: "spring", stiffness: 100, delay: 0.1 }
      }
      className="w-full max-w-md shadow-2xl bg-blackshark-card border border-blackshark-accent rounded-none" // Adicionei rounded-none
    >
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <img src={SharkIcon} alt="Black Shark Icon" className="w-16 h-16" />
        </div>

        <CardTitle className="text-3xl font-headline tracking-tight text-blackshark-primary">
          Black Shark Analytics
        </CardTitle>
        <CardDescription className="text-blackshark-accent">
          Insira suas credenciais para acessar o painel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-blackshark-primary">
              Usuário
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="blackshark"
              {...form.register("username")}
              disabled={isLoading}
              className="bg-blackshark-card border border-blackshark-accent text-blackshark-primary focus:ring-blackshark-accent rounded-none"
              aria-invalid={form.formState.errors.username ? "true" : "false"}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-blackshark-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blackshark-primary">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                {...form.register("password")}
                className="bg-blackshark-card border border-blackshark-accent text-blackshark-primary focus:ring-blackshark-accent pr-10 rounded-none"
                aria-invalid={form.formState.errors.password ? "true" : "false"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 h-full px-3 text-blackshark-accent hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-blackshark-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blackshark-primary hover:bg-blackshark-primary/90 text-blackshark-background rounded-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <DotLoader />
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4 text-blackshark-background" />
                Login
              </>
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-blackshark-accent">
          Dica: Use o usuário `blackshark` ou as credenciais da sua migração do
          DB.
        </p>
      </CardContent>
    </AnimatedCard>
  );
}
