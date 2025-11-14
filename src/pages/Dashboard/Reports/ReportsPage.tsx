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
import { BarChart3, Calendar, Search, FileText } from "lucide-react";

export default function ReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const reportCards = [
    {
      title: t("reports.itemsReport.title"),
      description: t("reports.itemsReport.description"),
      icon: BarChart3,
      path: "/dashboard/reports/items",
      focus: t("reports.itemsReport.focus"),
    },
    {
      title: t("reports.dailyUnits.title"),
      description: t("reports.dailyUnits.description"),
      icon: Calendar,
      path: "/dashboard/reports/daily-units",
      focus: t("reports.dailyUnits.focus"),
      disabled: true,
    },
    {
      title: t("reports.inspector.title"),
      description: t("reports.inspector.description"),
      icon: Search,
      path: "/dashboard/reports/inspector",
      focus: t("reports.inspector.focus"),
      disabled: true,
    },
  ];

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header Card */}
      <Card className="shadow-lg border-[1px] border-gray-300/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <CardTitle>{t("reports.title")}</CardTitle>
          </div>
          <CardDescription>{t("reports.chooseAnalysis")}</CardDescription>
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
                            {t("common.focus")}: {report.focus}
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
                      {report.disabled
                        ? t("reports.comingSoon")
                        : t("reports.accessReport")}
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
                dangerouslySetInnerHTML={{ __html: t("reports.tipText") }}
              />
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
