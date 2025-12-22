import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Package, Users, TrendingUp, BarChart3 } from "lucide-react";

export default function PerformancePage() {
  const navigate = useNavigate();

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl text-foreground">
          Central de Performance
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Escolha o tipo de análise de performance que deseja visualizar
        </p>
      </div>

      {/* Performance Options Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Products Performance Card */}
        <Card className="shark-card group hover:border-cyan-500/50 transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Package className="w-12 h-12 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Performance de Produtos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Analise o desempenho dos seus produtos, visualize gráficos de
                  vendas, lucro e insights detalhados por produto.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <div className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5">
                  <BarChart3 className="w-3 h-3" />
                  <span>Gráficos</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5">
                  <TrendingUp className="w-3 h-3" />
                  <span>Insights AI</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5">
                  <Package className="w-3 h-3" />
                  <span>Agrupamento</span>
                </div>
              </div>
              <Button
                onClick={() => navigate("/dashboard/performance/products")}
                className="w-full mt-4"
                size="lg"
              >
                Ver Performance de Produtos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Affiliates Performance Card */}
        <Card className="shark-card group hover:border-yellow-500/50 transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Users className="w-12 h-12 text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Performance de Afiliados
                </h2>
                <p className="text-sm text-muted-foreground">
                  Monitore o desempenho dos seus afiliados, analise comissões,
                  conversões e identifique seus melhores parceiros.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <div className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5">
                  <Users className="w-3 h-3" />
                  <span>Comparação</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5">
                  <TrendingUp className="w-3 h-3" />
                  <span>Métricas</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5">
                  <BarChart3 className="w-3 h-3" />
                  <span>Rankings</span>
                </div>
              </div>
              <Button
                onClick={() => navigate("/dashboard/performance/affiliates")}
                className="w-full mt-4"
                size="lg"
                variant="outline"
              >
                Ver Performance de Afiliados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="shark-card border-cyan-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded bg-cyan-500/10">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-foreground">
                Análise de Performance Avançada
              </h3>
              <p className="text-sm text-muted-foreground">
                Utilize as ferramentas de análise de performance para tomar
                decisões baseadas em dados. Compare diferentes períodos,
                identifique tendências e otimize suas estratégias de vendas e
                marketing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
