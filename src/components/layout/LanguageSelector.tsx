import { Languages } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/ui/dropdown-menu";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useTranslation } from "react-i18next";

export function LanguageSelector() {
  const { language, setLanguage } = useDashboardConfig();
  const { t } = useTranslation();

  const languages = [
    { code: "pt-BR", label: t("language.portuguese"), flag: "🇧🇷" },
    { code: "en", label: t("language.english"), flag: "🇺🇸" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-none rounded-full"
        >
          <Languages className="h-[1.2rem] w-[1.2rem] dark:text-white" />
          <span className="sr-only">{t("language.selector")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 ${
              language === lang.code ? "bg-blue-700" : ""
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
