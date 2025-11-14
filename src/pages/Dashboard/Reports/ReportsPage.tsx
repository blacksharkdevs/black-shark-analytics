import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { BarChart3, Calendar, Search, FileText } from "lucide-react";

const reportCards = [
  {
    title: "Items Report",
    description:
      "Análise financeira granular por SKU. Filtre por vendas, upsells, recorrência ou reembolsos para entender a saúde financeira completa.",
    icon: BarChart3,
    path: "/dashboard/reports/items",
    focus: "FINANCEIRO",
  },
  {
    title: "Daily Unit Reports",
    description:
      "Análise operacional dia a dia. Acompanhe o ritmo de vendas de unidades novas (neworder) e identifique tendências e impactos de campanhas.",
    icon: Calendar,
    path: "/dashboard/reports/daily-units",
    focus: "TEMPO",
    disabled: true,
  },
  {
    title: "Main Product Inspector",
    description:
      "Análise estratégica de composição. Veja quais SKUs (kits) compõem as vendas de cada produto principal e otimize seu ticket médio.",
    icon: Search,
    path: "/dashboard/reports/inspector",
    focus: "ESTRATÉGIA",
    disabled: true,
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header Card */}
      <Card className="shadow-lg border-[1px] border-gray-300/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <CardTitle>Reports</CardTitle>
          </div>
          <CardDescription>
            Escolha o tipo de análise que você precisa fazer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Report Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reportCards.map((report) => {
              const Icon = report.icon;
              return (
                <Card
                  key={report.path}
                  className={`border-[1px] border-white/30 rounded-none shadow-lg transition-all ${
                    report.disabled
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:shadow-xl hover:border-primary/30 cursor-pointer"
                  }`}
                  onClick={() => !report.disabled && navigate(report.path)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-foreground">
                            {report.title}
                          </CardTitle>
                          <p className="text-xs font-semibold text-primary">
                            Foco: {report.focus}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-sm leading-relaxed">
                      {report.description}
                    </CardDescription>
                    <Button
                      variant={report.disabled ? "outline" : "default"}
                      className="w-full"
                      disabled={report.disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!report.disabled) navigate(report.path);
                      }}
                    >
                      {report.disabled ? "Em breve" : "Acessar Relatório"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="p-4 mt-6 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Use{" "}
              <strong className="text-foreground">Items Report</strong> para
              análise financeira completa,{" "}
              <strong className="text-foreground">Daily Units</strong> para
              acompanhar ritmo de vendas, e{" "}
              <strong className="text-foreground">Inspector</strong> para
              otimizar sua estratégia de produtos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
