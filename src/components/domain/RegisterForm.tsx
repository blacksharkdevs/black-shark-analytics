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
import { UserPlus, Eye, EyeOff } from "lucide-react"; // Usamos UserPlus para registro
import { DotLoader } from "../common/ui/DotLoader";
import { SharkSwim } from "../common/SharkSwin";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "../common/LoadingScreen";

// 🚨 NOVO SCHEMA: Adiciona a validação do token secreto
const registerSchema = z.object({
  username: z.string().min(1, { message: "O nome de usuário é obrigatório" }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
  secretToken: z
    .string()
    .min(1, { message: "O token secreto é obrigatório para registro" }),
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

  const REGISTRATION_SECRET = import.meta.env.VITE_REGISTRATION_SECRET;

  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", secretToken: "" },
  });

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (data.secretToken !== REGISTRATION_SECRET) {
      controls.start(shakeAnimation);
      toast({
        title: "Registration Failure",
        description: "User already exists or database error.",
        variant: "destructive",
      });
      return;
    }

    const success = await registerUser(data.username, data.password);

    if (success) {
      setIsRegisterSuccess(true);
    } else {
      controls.start(shakeAnimation);
      toast({
        title: "Registration Failure",
        description: "User already exists or database error.",
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
      className="w-full max-w-md bg-transparent border rounded-none shadow-2xl border-blackshark-accent"
    >
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <SharkSwim width={170} />
        </div>
        <CardTitle className="text-3xl tracking-tight text-white font-headline">
          Administrator Registration
        </CardTitle>
        <CardDescription className="text-white">
          Create your access user. Requires Secret Token.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="new username"
              {...form.register("username")}
              disabled={isLoading}
              className="border rounded-none border-blackshark-accent text-blackshark-primary focus:ring-blackshark-accent"
              aria-invalid={form.formState.errors.username ? "true" : "false"}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-blackshark-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
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

          <div className="space-y-2">
            <Label htmlFor="secretToken" className="text-white">
              Token
            </Label>
            <Input
              id="secretToken"
              type="password"
              placeholder="myaccesstoken123"
              {...form.register("secretToken")}
              disabled={isLoading}
              className="border rounded-none"
              aria-invalid={
                form.formState.errors.secretToken ? "true" : "false"
              }
            />
            {form.formState.errors.secretToken && (
              <p className="text-sm text-blackshark-destructive">
                {form.formState.errors.secretToken.message}
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
                Register
              </>
            )}
          </Button>

          <p className="mt-4 text-sm text-center text-blue-600/70">
            Already have an account?{" "}
            <a
              onClick={() => navigate("/login")}
              className="font-medium cursor-pointer hover:underline"
            >
              Log In
            </a>
          </p>
        </form>
      </CardContent>
    </AnimatedCard>
  );
}
