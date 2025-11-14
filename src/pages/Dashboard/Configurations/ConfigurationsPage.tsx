import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Settings, LinkIcon, Package } from "lucide-react";

const configCards = [
  {
    title: "SKU Mapping",
    description:
      "Configure o mapeamento entre SKUs da plataforma e produtos principais. Defina quais códigos de produto correspondem a cada item do seu catálogo.",
    icon: LinkIcon,
    path: "/dashboard/configurations/sku-mapping",
    focus: "MAPEAMENTO",
  },
  {
    title: "Main Products",
    description:
      "Gerencie seus produtos principais e suas configurações. Organize e categorize os produtos do seu negócio para análises mais eficientes.",
    icon: Package,
    path: "/dashboard/configurations/main-products",
    focus: "CATÁLOGO",
  },
];

export default function ConfigurationsPage() {
  const navigate = useNavigate();

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header Card */}
      <Card className="shadow-lg border-[1px] border-gray-300/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <CardTitle>Configurations</CardTitle>
          </div>
          <CardDescription>
            Configure os mapeamentos e produtos do seu sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Config Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {configCards.map((config) => {
              const Icon = config.icon;
              return (
                <Card
                  key={config.path}
                  className="border-[1px] border-white/30 rounded-none shadow-lg transition-all hover:shadow-xl hover:border-primary/30 cursor-pointer"
                  onClick={() => navigate(config.path)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-foreground">
                            {config.title}
                          </CardTitle>
                          <p className="text-xs font-semibold text-primary">
                            Foco: {config.focus}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-sm leading-relaxed">
                      {config.description}
                    </CardDescription>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(config.path);
                      }}
                    >
                      Acessar Configuração
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="p-4 mt-6 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Configure o{" "}
              <strong className="text-foreground">SKU Mapping</strong> primeiro
              para garantir que seus produtos sejam reconhecidos corretamente,
              depois organize seu catálogo em{" "}
              <strong className="text-foreground">Main Products</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
