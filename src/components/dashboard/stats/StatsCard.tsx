import React from "react";
import CountUp from "react-countup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

interface StatsCardProps {
  title: string;
  value: string;
  rawValue: number;
  icon: React.ElementType;
  description: string;
  isLoading: boolean;
  explanation?: string;
  formula?: string;
  isMonetary?: boolean;
}

export function StatsCard({
  title,
  value,
  rawValue,
  icon: Icon,
  description,
  isLoading,
  explanation,
  formula,
  isMonetary = false,
}: StatsCardProps) {
  const isCurrency = value.includes("$");
  const duration = 1.5;

  const countUpProps = isCurrency
    ? {
        prefix: "$",
        decimals: 2,
        separator: ",",
        decimal: ".",
        formattingFn: (val: number) =>
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      }
    : {
        separator: ",",
        decimals: 0,
        formattingFn: (val: number) =>
          val.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      };

  if (isLoading) {
    return (
      <Card className="transition-shadow duration-300 border rounded-none shadow-lg hover:shadow-xl border-white/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Skeleton className="w-3/4 h-4 rounded-none bg-accent/20" />
          <Skeleton className="w-6 h-6 rounded-none bg-accent/20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-1/2 h-8 mb-1 rounded-none bg-accent/30" />
          <Skeleton className="w-full h-4 rounded-none bg-accent/20" />
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <Card className="transition-shadow duration-300 border rounded-none shadow-lg hover:shadow-xl border-white/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-blue-600 dark:text-white">
          <Icon className="w-7 h-7" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 text-2xl font-bold text-foreground">
          {isMonetary && <p>$</p>}
          <CountUp
            start={0}
            end={rawValue}
            duration={duration}
            {...countUpProps}
          />
        </div>
        {description && (
          <p className="pt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (formula || explanation) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
        <TooltipContent
          className="max-w-md p-3 text-lg whitespace-pre-wrap border rounded-none shadow-md bg-card text-foreground border-border"
          side="bottom"
          align="center"
        >
          {explanation && <p className="mb-1 font-semibold">{explanation}</p>}
          {formula && (
            <p className="text-base text-muted-foreground">
              <span className="font-medium">Formula:</span> {formula}
            </p>
          )}
          {!explanation && !formula && (
            <p className="text-muted-foreground">No details available.</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
}
