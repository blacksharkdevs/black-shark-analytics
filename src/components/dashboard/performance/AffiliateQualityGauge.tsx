import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { useTranslation } from "react-i18next";

interface Props {
  chargebackRate: number;
}

export function AffiliateQualityGauge({ chargebackRate }: Props) {
  const { t } = useTranslation();

  const getChargebackColor = (rate: number) => {
    if (rate < 1) return "text-green-400";
    if (rate < 2) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="shark-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          {t("affiliate.fraudDetector")}
        </CardTitle>
        <CardDescription>{t("affiliate.fraudDetectorDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div
              className={`text-6xl font-bold ${getChargebackColor(
                chargebackRate
              )}`}
            >
              {chargebackRate.toFixed(2)}%
            </div>
            <div className="mt-4 space-y-2">
              <div
                className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  chargebackRate < 1
                    ? "bg-green-950/50 text-green-400 border border-green-500/30"
                    : chargebackRate < 2
                    ? "bg-yellow-950/50 text-yellow-400 border border-yellow-500/30"
                    : "bg-red-950/50 text-red-400 border border-red-500/30"
                }`}
              >
                {chargebackRate < 1
                  ? `${t("affiliate.safe")}`
                  : chargebackRate < 2
                  ? `${t("affiliate.attention")}`
                  : `${t("affiliate.highRisk")}`}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {chargebackRate < 1 && t("affiliate.excellentQuality")}
                {chargebackRate >= 1 &&
                  chargebackRate < 2 &&
                  t("affiliate.monitorClosely")}
                {chargebackRate >= 2 && t("affiliate.dangerBlocking")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">0-1%</div>
            <div className="text-xs text-muted-foreground">
              {t("affiliate.greenSafe")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">1-2%</div>
            <div className="text-xs text-muted-foreground">
              {t("affiliate.yellowAttention")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">2%+</div>
            <div className="text-xs text-muted-foreground">
              {t("affiliate.redRisk")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
