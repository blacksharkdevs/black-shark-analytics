import { format, parseISO } from "date-fns";
import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/index";
import { useTranslation } from "react-i18next";

interface DailyMetrics {
  date: string;
  revenue: number;
  commission: number;
  sales: number;
}

interface Props {
  data: DailyMetrics[];
}

export function AffiliateTrendChart({ data }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="shark-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          {t("affiliate.performanceTrend")}
        </CardTitle>
        <CardDescription>{t("affiliate.performanceTrendDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#888"
              fontSize={12}
              tickFormatter={(date) => format(parseISO(date), "dd/MM")}
            />
            <YAxis
              yAxisId="left"
              stroke="#888"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#888"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              labelFormatter={(date) =>
                format(parseISO(date as string), "dd/MM/yyyy")
              }
              formatter={(value: number, name: string) => {
                if (name === t("affiliate.sales")) return [value, name];
                return [formatCurrency(value), name];
              }}
            />
            <Legend />
            <Bar
              yAxisId="right"
              dataKey="sales"
              fill="#444"
              opacity={0.3}
              name={t("affiliate.sales")}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#00ff00"
              strokeWidth={3}
              dot={{ fill: "#00ff00", r: 4 }}
              name={t("affiliate.revenue")}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="commission"
              stroke="#ff0000"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#ff0000", r: 3 }}
              name={t("affiliate.commission")}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 rounded-lg bg-blue-950/20 border border-blue-500/30">
          <p className="text-sm text-blue-200">
            💡 <strong>{t("common.insight")}:</strong>{" "}
            {t("affiliate.trendInsight")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
