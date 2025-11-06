import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  motion,
  useAnimation,
  type AnimationDefinition,
  type Variants,
} from "framer-motion";
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
import { DotLoader } from "../common/ui/DotLoader";
import { SharkSwim } from "../common/SharkSwin";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "../common/LoadingScreen";

const loginSchema = z.object({
  username: z.string().min(1, { message: "O nome de usuário é obrigatório" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AnimatedCard = motion(Card);

const fadeVariants: Variants = {
  initial: {
    y: 150,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.1,
    },
  },
};

const shakeAnimation: AnimationDefinition = {
  x: [0, -15, 15, -10, 10, -5, 5, 0],
  transition: {
    type: "tween",
    duration: 0.8,
    ease: "easeInOut",
  },
};

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const controls = useAnimation();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data.username, data.password);

    if (success) {
      setIsLoginSuccess(true);
    } else {
      controls.start(shakeAnimation);

      toast({
        title: "Falha no Login",
        description: "Nome de usuário ou senha inválidos.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isLoginSuccess) {
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoginSuccess, navigate]);

  if (isLoginSuccess) {
    return <LoadingScreen />;
  }

  return (
    <AnimatedCard
      variants={fadeVariants}
      animate={controls}
      initial="initial"
      className="w-full max-w-md border rounded-none shadow-2xl bg-blackshark-card border-blackshark-accent"
    >
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <SharkSwim width={170} />
        </div>

        <CardTitle className="text-3xl tracking-tight font-headline text-blackshark-primary">
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
              className="border rounded-none bg-blackshark-card border-blackshark-accent text-blackshark-primary focus:ring-blackshark-accent"
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
                className="pr-10 border rounded-none bg-blackshark-card border-blackshark-accent text-blackshark-primary focus:ring-blackshark-accent"
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
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
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
            className="w-full rounded-none bg-blackshark-primary hover:bg-blackshark-primary/90 text-blackshark-background"
            disabled={isLoading}
          >
            {isLoading ? (
              <DotLoader />
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2 text-blackshark-background" />
                Login
              </>
            )}
          </Button>
        </form>
        <p className="mt-4 text-sm text-center text-blackshark-accent">
          Dica: Use o usuário `blackshark` ou as credenciais da sua migração do
          DB.
        </p>
      </CardContent>
    </AnimatedCard>
  );
}
