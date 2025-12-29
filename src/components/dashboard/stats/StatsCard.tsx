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
      <div className="flex items-center justify-between p-2 transition-colors md:p-4">
        <div className="flex items-center flex-1 gap-2 md:gap-4">
          <Skeleton className="w-8 h-8 md:w-10 md:h-10" />
          <div className="flex-1 space-y-1 md:space-y-2">
            <Skeleton className="w-1/3 h-3 md:h-4" />
            <Skeleton className="w-full h-2 md:h-3" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 md:w-24 md:h-8" />
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
    <div className="flex items-center justify-between p-2 transition-colors rounded-lg cursor-pointer md:p-4 md:rounded-xl hover:bg-accent/10">
      <div className="flex items-center flex-1 gap-2 md:gap-4">
        <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
          <Icon className="w-4 h-4 md:w-6 md:h-6 text-primary" />
        </div>
        <div className="space-y-0.5 md:space-y-1 max-w-[140px] md:max-w-[180px]">
          <h3 className="text-xs font-semibold leading-tight md:text-base text-foreground">
            {title}
          </h3>
        </div>
      </div>
      <div className="text-base font-bold text-blue-700 md:text-xl xl:text-2xl tabular-nums">
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
        className="p-3 md:p-4 w-72 md:w-96 shark-card"
        sideOffset={8}
      >
        <pre className="font-sans text-xs whitespace-pre-wrap md:text-sm text-foreground">
          {explanation}
        </pre>
      </HoverCardContent>
    </HoverCard>
  );
}
