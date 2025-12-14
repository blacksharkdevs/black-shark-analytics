import React, { useState } from "react";
import CountUp from "react-countup";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Card, CardContent } from "@/components/common/ui/card";

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
  rawValue,
  icon: Icon,
  description,
  isLoading,
  explanation,
  isMonetary = false,
}: StatsCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const duration = 1.5;

  const countUpProps = isMonetary
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
      <div className="flex items-center justify-between p-4 transition-colors">
        <div className="flex items-center flex-1 gap-4">
          <Skeleton className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-full h-3" />
          </div>
        </div>
        <Skeleton className="w-24 h-8" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-accent/50"
        onMouseEnter={() => setShowExplanation(true)}
        onMouseLeave={() => setShowExplanation(false)}
      >
        <div className="flex items-center flex-1 gap-4">
          <div className="flex items-center justify-center w-10 h-10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">
          {isMonetary && "$"}
          <CountUp
            start={0}
            end={rawValue}
            duration={duration}
            {...countUpProps}
          />
        </div>
      </div>

      {showExplanation && explanation && (
        <Card className="absolute top-0 z-50 ml-4 shadow-lg left-full w-96">
          <CardContent className="p-4">
            <pre className="font-sans text-sm whitespace-pre-wrap text-foreground">
              {explanation}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
