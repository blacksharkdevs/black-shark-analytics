import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/index";

interface HealthMonitorProps {
  filteredSalesData: Transaction[];
  isLoading: boolean;
}

interface HealthData {
  totalSales: number;
  refunds: number;
  chargebacks: number;
  refundRate: number;
  chargebackRate: number;
  status: "healthy" | "warning" | "critical";
  statusColor: string;
  statusIcon: React.ReactNode;
  statusText: string;
}

export function HealthMonitor({
  filteredSalesData,
  isLoading,
}: HealthMonitorProps) {
  const { t } = useTranslation();

  const healthData = useMemo((): HealthData | null => {
    // Contar vendas totais
    const totalSales = filteredSalesData.filter(
      (t) => t.type === "SALE" && t.status === "COMPLETED"
    ).length;

    if (totalSales === 0) {
      return null;
    }

    // Contar reembolsos
    const refunds = filteredSalesData.filter(
      (t) => t.status === "REFUNDED" || t.type === "REFUND"
    ).length;

    // Contar chargebacks
    const chargebacks = filteredSalesData.filter(
      (t) => t.status === "CHARGEBACK" || t.type === "CHARGEBACK"
    ).length;

    // Calcular taxas
    const refundRate = (refunds / totalSales) * 100;
    const chargebackRate = (chargebacks / totalSales) * 100;

    // Determinar status (baseado principalmente em chargebacks)
    let status: "healthy" | "warning" | "critical";
    let statusColor: string;
    let statusIcon: React.ReactNode;
    let statusText: string;

    if (chargebackRate < 1) {
      status = "healthy";
      statusColor = "#00ff00";
      statusIcon = <ShieldCheck className="w-6 h-6" />;
      statusText = t("performance.health.statusHealthy");
    } else if (chargebackRate < 2) {
      status = "warning";
      statusColor = "#ffff00";
      statusIcon = <AlertTriangle className="w-6 h-6" />;
      statusText = t("performance.health.statusWarning");
    } else {
      status = "critical";
      statusColor = "#ff0000";
      statusIcon = <ShieldAlert className="w-6 h-6" />;
      statusText = t("performance.health.statusCritical");
    }

    return {
      totalSales,
      refunds,
      chargebacks,
      refundRate,
      chargebackRate,
      status,
      statusColor,
      statusIcon,
      statusText,
    };
  }, [filteredSalesData, t]);

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <Skeleton className="w-48 h-6 mb-1" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="pb-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Card className="shark-card">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("performance.health.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular ângulo do ponteiro (0-180 graus, onde 0 = esquerda, 180 = direita)
  const maxRate = 3; // 3% é o máximo no gauge
  const angle = Math.min((healthData.chargebackRate / maxRate) * 180, 180);

  return (
    <Card className="shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              healthData.status === "healthy" && "bg-green-500/10",
              healthData.status === "warning" && "bg-yellow-500/10",
              healthData.status === "critical" && "bg-red-500/10 animate-pulse"
            )}
            style={{ color: healthData.statusColor }}
          >
            {healthData.statusIcon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg">
              {t("performance.health.title")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("performance.health.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Gauge Visual */}
        <div className="relative flex flex-col items-center justify-center py-6">
          {/* Arco do Gauge */}
          <svg
            width="240"
            height="140"
            viewBox="0 0 240 140"
            className="overflow-visible"
          >
            {/* Background Arc */}
            <path
              d="M 20,120 A 100,100 0 0,1 220,120"
              fill="none"
              stroke="#1e293b"
              strokeWidth="20"
              strokeLinecap="round"
            />

            {/* Colored Segments */}
            {/* Verde (0-1%) */}
            <path
              d="M 20,120 A 100,100 0 0,1 80,33"
              fill="none"
              stroke="#00ff00"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Amarelo (1-2%) */}
            <path
              d="M 80,33 A 100,100 0 0,1 160,33"
              fill="none"
              stroke="#ffff00"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Vermelho (2%+) */}
            <path
              d="M 160,33 A 100,100 0 0,1 220,120"
              fill="none"
              stroke="#ff0000"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Ponteiro (Needle) */}
            <g transform={`rotate(${angle - 90} 120 120)`}>
              <line
                x1="120"
                y1="120"
                x2="120"
                y2="35"
                stroke={healthData.statusColor}
                strokeWidth="3"
                strokeLinecap="round"
                filter="drop-shadow(0 0 8px currentColor)"
              />
              <circle
                cx="120"
                cy="120"
                r="8"
                fill={healthData.statusColor}
                filter="drop-shadow(0 0 8px currentColor)"
              />
            </g>

            {/* Markers */}
            <text x="0" y="145" fill="#FFF" fontSize="10" textAnchor="middle">
              0%
            </text>
            <text x="120" y="0" fill="#FFF" fontSize="10" textAnchor="middle">
              1.5%
            </text>
            <text x="230" y="145" fill="#FFF" fontSize="10" textAnchor="middle">
              3%
            </text>
          </svg>

          {/* Valor Central */}
          <div className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p
              className={cn(
                "text-4xl font-bold tabular-nums md:text-5xl",
                healthData.status === "critical" && "animate-pulse"
              )}
              style={{ color: healthData.statusColor }}
            >
              {healthData.chargebackRate.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("performance.health.chargebackRate")}
            </p>
          </div>
        </div>

        {/* Status Text */}
        <div
          className={cn(
            "p-3 rounded-lg border text-center",
            healthData.status === "healthy" &&
              "bg-green-500/10 border-green-500/30",
            healthData.status === "warning" &&
              "bg-yellow-500/10 border-yellow-500/30",
            healthData.status === "critical" &&
              "bg-red-500/10 border-red-500/30 animate-pulse"
          )}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: healthData.statusColor }}
          >
            {t("performance.health.status")}: {healthData.statusText}
          </p>
        </div>

        {/* Métricas Detalhadas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded bg-white/5">
            <span className="text-xs text-muted-foreground">
              {t("performance.health.totalSales")}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {healthData.totalSales.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white/5">
            <span className="text-xs text-muted-foreground">
              {t("performance.health.refunds")}
            </span>
            <span className="text-sm font-semibold text-orange-400">
              {healthData.refunds} ({healthData.refundRate.toFixed(2)}%)
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white/5">
            <span className="text-xs text-muted-foreground">
              {t("performance.health.chargebacks")}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: healthData.statusColor }}
            >
              {healthData.chargebacks} ({healthData.chargebackRate.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Warning Message */}
        {healthData.status !== "healthy" && (
          <div
            className={cn(
              "p-3 rounded-lg border text-xs leading-relaxed",
              healthData.status === "warning" &&
                "bg-yellow-500/10 border-yellow-500/30 text-yellow-200",
              healthData.status === "critical" &&
                "bg-red-500/10 border-red-500/30 text-red-200"
            )}
          >
            {healthData.status === "warning"
              ? t("performance.health.warningMessage")
              : t("performance.health.criticalMessage")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
