import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Settings, LinkIcon, Package } from "lucide-react";

export default function ConfigurationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const configCards = [
    {
      title: t("configurations.skuMapping.title"),
      description: t("configurations.skuMapping.description"),
      icon: LinkIcon,
      path: "/dashboard/configurations/sku-mapping",
      focus: t("configurations.skuMapping.focus"),
    },
    {
      title: t("configurations.mainProducts.title"),
      description: t("configurations.mainProducts.description"),
      icon: Package,
      path: "/dashboard/configurations/main-products",
      focus: t("configurations.mainProducts.focus"),
    },
  ];

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header Card */}
      <Card className="shadow-lg border-[1px] border-gray-300/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <CardTitle>{t("configurations.title")}</CardTitle>
          </div>
          <CardDescription>{t("configurations.description")}</CardDescription>
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
                            {t("common.focus")}: {config.focus}
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
                      {t("configurations.accessConfiguration")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="p-4 mt-6 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              💡 <strong>{t("reports.tip")}:</strong>{" "}
              <span
                dangerouslySetInnerHTML={{
                  __html: t("configurations.tipText"),
                }}
              />
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
