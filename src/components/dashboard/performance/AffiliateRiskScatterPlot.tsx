import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface AffiliateMetrics {
  id: string;
  name: string;
  totalRevenue: number;
  totalNet: number;
  salesCount: number;
  commissionPaid: number;
  refundCount: number;
  refundRate: number;
}

interface AffiliateRiskScatterPlotProps {
  affiliateMetrics: AffiliateMetrics[];
  isLoading: boolean;
  selectedAffiliateIds: string[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AffiliateMetrics & { x: number; y: number };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  const getRiskLevel = (refundRate: number) => {
    if (refundRate < 1)
      return { label: "Baixo Risco", color: "text-green-400" };
    if (refundRate < 3)
      return { label: "Médio Risco", color: "text-yellow-400" };
    return { label: "Alto Risco", color: "text-red-400" };
  };

  const risk = getRiskLevel(data.refundRate);

  return (
    <div className="p-3 border rounded-lg shadow-lg bg-card border-border">
      <div className="mb-2 text-sm font-bold text-white">{data.name}</div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Volume de Vendas:</span>
          <span className="font-bold text-white">{data.salesCount}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Taxa de Reembolso:</span>
          <span className={`font-bold ${risk.color}`}>
            {data.refundRate.toFixed(1)}%
          </span>
        </div>
        <div className="pt-2 mt-2 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Nível de Risco:</span>
            <span className={`font-bold ${risk.color}`}>{risk.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function AffiliateRiskScatterPlot({
  affiliateMetrics,
  isLoading,
  selectedAffiliateIds,
}: AffiliateRiskScatterPlotProps) {
  const { t } = useTranslation();

  const scatterData = useMemo(() => {
    return affiliateMetrics
      .filter((a) => selectedAffiliateIds.includes(a.id))
      .map((affiliate) => ({
        ...affiliate,
        x: affiliate.salesCount,
        y: affiliate.refundRate,
      }));
  }, [affiliateMetrics, selectedAffiliateIds]);

  const getPointColor = (refundRate: number) => {
    if (refundRate < 1) return "#00ff00"; // Verde
    if (refundRate < 3) return "#ffff00"; // Amarelo
    return "#ff0000"; // Vermelho
  };

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-64 h-4 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-96" />
        </CardContent>
      </Card>
    );
  }

  if (scatterData.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            {t("performance.affiliates.riskAnalysis")}
          </CardTitle>
          <CardDescription>
            {t("performance.affiliates.riskAnalysisDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            {t("performance.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          {t("performance.affiliates.riskAnalysis")}
        </CardTitle>
        <CardDescription>
          {t("performance.affiliates.riskAnalysisDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              dataKey="x"
              name="Sales Volume"
              stroke="#888"
              fontSize={12}
            >
              <Label
                value={t("performance.affiliates.salesVolume")}
                position="bottom"
                offset={20}
                style={{ fill: "#888", fontSize: 12 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              name="Refund Rate"
              stroke="#888"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            >
              <Label
                value={t("performance.affiliates.refundRate")}
                angle={-90}
                position="insideLeft"
                style={{ fill: "#888", fontSize: 12, textAnchor: "middle" }}
              />
            </YAxis>
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3" }}
            />

            {/* Linhas de referência para zonas de risco */}
            <ReferenceLine
              y={1}
              stroke="#00ff00"
              strokeDasharray="3 3"
              label={{
                value: "1% (Baixo Risco)",
                fill: "#00ff00",
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={3}
              stroke="#ffff00"
              strokeDasharray="3 3"
              label={{
                value: "3% (Alto Risco)",
                fill: "#ffff00",
                fontSize: 10,
              }}
            />

            <Scatter
              name="Afiliados"
              data={scatterData}
              fill="#00ffff"
              shape={(props: unknown) => {
                const { cx, cy, payload } = props as {
                  cx: number;
                  cy: number;
                  payload: AffiliateMetrics & { x: number; y: number };
                };
                const color = getPointColor(payload.refundRate);
                const size = Math.max(6, Math.min(payload.salesCount / 10, 20)); // Tamanho baseado no volume

                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill={color}
                    fillOpacity={0.7}
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-muted-foreground">
              {"< 1%"} - Baixo Risco
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-muted-foreground">1-3% - Médio Risco</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-muted-foreground">{"> 3%"} - Alto Risco</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
