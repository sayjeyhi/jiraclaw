"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStatePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyStatePlaceholder({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStatePlaceholderProps) {
  const action = actionHref ? (
    <Button asChild size="lg">
      <Link href={actionHref}>{actionLabel}</Link>
    </Button>
  ) : (
    <Button onClick={onAction} size="lg">
      {actionLabel}
    </Button>
  );

  return (
    <Empty className={cn("border-border bg-muted/30 min-h-[320px] border", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary/10 text-primary size-16 [&_svg]:size-10">
          <Icon strokeWidth={1.25} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{action}</EmptyContent>
    </Empty>
  );
}
