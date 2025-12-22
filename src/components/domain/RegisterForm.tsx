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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff } from "lucide-react"; // Usamos UserPlus para registro
import { DotLoader } from "../common/ui/DotLoader";
import { SharkSwim } from "../common/SharkSwin";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "../common/LoadingScreen";

const registerSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  email: z
    .string()
    .min(1, { message: "O email é obrigatório" })
    .email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  role: z.enum(["ADMIN", "USER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const AnimatedCard = motion(Card);

const fadeVariants: Variants = {
  initial: { y: 150, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.1 },
  },
};

const shakeAnimation: AnimationDefinition = {
  x: [0, -15, 15, -10, 10, -5, 5, 0],
  transition: { type: "tween", duration: 0.8, ease: "easeInOut" },
};

export function RegisterForm() {
  const { registerUser, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const controls = useAnimation();

  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "ADMIN" },
  });

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const onSubmit = async (data: RegisterFormValues) => {
    const success = await registerUser(
      data.name,
      data.email,
      data.password,
      data.role
    );

    if (success) {
      setIsRegisterSuccess(true);
    } else {
      controls.start(shakeAnimation);
      toast({
        title: "Falha no Registro",
        description: "Usuário já existe ou erro no servidor.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isRegisterSuccess) {
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isRegisterSuccess, navigate]);

  if (isRegisterSuccess) {
    return <LoadingScreen />;
  }

  return (
    <AnimatedCard
      variants={fadeVariants}
      animate={controls}
      initial="initial"
      className="w-full md:w-[450px] bg-transparent border rounded-none shadow-2xl border-border"
    >
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <SharkSwim width={170} />
        </div>
        <CardTitle className="text-3xl tracking-tight text-white font-headline">
          Registro de Usuário
        </CardTitle>
        <CardDescription className="text-white">
          Crie sua conta de acesso ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Victor Silva"
              {...form.register("name")}
              disabled={isLoading}
              className="border rounded-none border-border text-foreground focus:ring-accent"
              aria-invalid={form.formState.errors.name ? "true" : "false"}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="victor@blackshark.com"
              {...form.register("email")}
              disabled={isLoading}
              className="border rounded-none border-border text-foreground focus:ring-accent"
              aria-invalid={form.formState.errors.email ? "true" : "false"}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                {...form.register("password")}
                className="pr-10 border rounded-none border-border text-foreground focus:ring-accent"
                aria-invalid={form.formState.errors.password ? "true" : "false"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
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
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">
              Função
            </Label>
            <select
              id="role"
              {...form.register("role")}
              disabled={isLoading}
              className="flex w-full h-10 px-3 py-2 text-sm border rounded-none border-border bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="ADMIN">Administrador</option>
              <option value="USER">Usuário</option>
            </select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-none bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <DotLoader />
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Registrar
              </>
            )}
          </Button>

          <p className="mt-4 text-sm text-center text-blue-600/70">
            Já tem uma conta?{" "}
            <a
              onClick={() => navigate("/login")}
              className="font-medium cursor-pointer hover:underline"
            >
              Fazer Login
            </a>
          </p>
        </form>
      </CardContent>
    </AnimatedCard>
  );
}
