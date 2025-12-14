/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo } from "react";
import CountUp from "react-countup";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/common/ui/hover-card";

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

  // Memoizar o CountUp para evitar re-animação no hover
  const countUpComponent = useMemo(
    () => (
      <CountUp start={0} end={rawValue} duration={duration} {...countUpProps} />
    ),
    [rawValue, duration, countUpProps]
  );

  const cardContent = (
    <div className="flex items-center justify-between p-4 transition-colors cursor-pointer rounded-xl hover:bg-accent/50">
      <div className="flex items-center flex-1 gap-4">
        <div className="flex items-center justify-center w-10 h-10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1 max-w-[180px]">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {isMonetary && "$"}
        {countUpComponent}
      </div>
    </div>
  );

  if (!explanation) {
    return <div>{cardContent}</div>;
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{cardContent}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="p-4 w-96"
        sideOffset={8}
      >
        <pre className="font-sans text-sm whitespace-pre-wrap text-foreground">
          {explanation}
        </pre>
      </HoverCardContent>
    </HoverCard>
  );
}
