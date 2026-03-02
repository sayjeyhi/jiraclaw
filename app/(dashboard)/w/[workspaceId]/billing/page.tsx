"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Users,
  Bot,
  BrainCircuit,
  Radio,
  ScrollText,
  Kanban,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanFeature {
  label: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  seats: number;
  badge?: string;
  features: PlanFeature[];
  services: {
    bots: number | "Unlimited";
    jira: number | "Unlimited";
    aiModels: number | "Unlimited";
    channels: number | "Unlimited";
    prompts: number | "Unlimited";
    logs: string;
  };
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "For individuals getting started with Jira automation.",
    seats: 1,
    features: [
      { label: "1 team member", included: true },
      { label: "2 active bots", included: true },
      { label: "1 Jira project", included: true },
      { label: "3 AI providers", included: true },
      { label: "2 channels", included: true },
      { label: "7-day log retention", included: true },
      { label: "Custom prompts", included: false },
      { label: "Priority support", included: false },
    ],
    services: {
      bots: 2,
      jira: 1,
      aiModels: 3,
      channels: 2,
      prompts: 5,
      logs: "7 days",
    },
  },
  {
    id: "personal",
    name: "Personal",
    price: 12,
    period: "per month",
    description: "For professionals who need more power and flexibility.",
    seats: 3,
    badge: "Popular",
    features: [
      { label: "Up to 3 team members", included: true },
      { label: "10 active bots", included: true },
      { label: "5 Jira projects", included: true },
      { label: "All AI providers", included: true },
      { label: "All channels", included: true },
      { label: "30-day log retention", included: true },
      { label: "Custom prompts", included: true },
      { label: "Priority support", included: false },
    ],
    services: {
      bots: 10,
      jira: 5,
      aiModels: "Unlimited",
      channels: "Unlimited",
      prompts: "Unlimited",
      logs: "30 days",
    },
  },
  {
    id: "team",
    name: "Team",
    price: 39,
    period: "per month",
    description: "For teams that need unlimited resources and priority support.",
    seats: 25,
    features: [
      { label: "Up to 25 team members", included: true },
      { label: "Unlimited bots", included: true },
      { label: "Unlimited Jira projects", included: true },
      { label: "All AI providers", included: true },
      { label: "All channels", included: true },
      { label: "Unlimited log retention", included: true },
      { label: "Custom prompts", included: true },
      { label: "Priority support", included: true },
    ],
    services: {
      bots: "Unlimited",
      jira: "Unlimited",
      aiModels: "Unlimited",
      channels: "Unlimited",
      prompts: "Unlimited",
      logs: "Unlimited",
    },
  },
];

const serviceIcons = [
  { key: "bots", label: "Bots", icon: Bot },
  { key: "jira", label: "Jira Projects", icon: Kanban },
  { key: "aiModels", label: "AI Providers", icon: BrainCircuit },
  { key: "channels", label: "Channels", icon: Radio },
  { key: "prompts", label: "Prompts", icon: ScrollText },
  { key: "logs", label: "Log Retention", icon: ScrollText },
];

export default function BillingPage() {
  const router = useRouter();
  const [currentPlan] = useState("free");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  async function handleSelectPlan(planId: string) {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUpgrading(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <CreditCard className="text-primary size-5" />
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Billing</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-foreground text-sm font-semibold">Choose your plan</h2>
        <p className="text-muted-foreground text-xs">
          Select a plan that fits your team size and automation needs.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isUpgrading = upgrading === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl border p-6 transition-all",
                plan.badge ? "border-primary/40 bg-primary/[0.03]" : "border-border bg-card",
                isCurrent && "ring-primary/20 ring-2",
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-2.5 right-4 text-[10px]">{plan.badge}</Badge>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-foreground text-lg font-semibold">{plan.name}</h3>
                  {isCurrent && (
                    <Badge variant="outline" className="text-[10px]">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{plan.description}</p>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-foreground text-3xl font-bold tracking-tight">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground text-xs">/{plan.period}</span>
              </div>

              <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                <Users className="size-3" />
                {plan.seats === 1 ? "1 seat" : `Up to ${plan.seats} seats`}
              </div>

              <Button
                className="mt-5 w-full text-xs"
                variant={isCurrent ? "outline" : plan.badge ? "default" : "outline"}
                disabled={isCurrent || !!upgrading}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {isUpgrading && <Loader2 className="mr-1.5 size-3 animate-spin" />}
                {isCurrent ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
              </Button>

              {/* Features list */}
              <div className="border-border mt-6 flex flex-col gap-2 border-t pt-4">
                <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Features
                </span>
                {plan.features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-2 text-xs">
                    <Check
                      className={cn(
                        "size-3 shrink-0",
                        feature.included ? "text-emerald-500" : "text-muted-foreground/30",
                      )}
                    />
                    <span
                      className={cn(
                        feature.included ? "text-foreground" : "text-muted-foreground line-through",
                      )}
                    >
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Service limits */}
              <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4">
                <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Service Limits
                </span>
                {serviceIcons.map(({ key, label, icon: Icon }) => {
                  const value = plan.services[key as keyof typeof plan.services];
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Icon className="size-3" />
                        {label}
                      </div>
                      <span
                        className={cn(
                          "font-medium",
                          value === "Unlimited" ? "text-emerald-500" : "text-foreground",
                        )}
                      >
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current plan summary */}
      <div className="border-border bg-card rounded-lg border p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-foreground text-sm font-semibold">Current Plan: Free</h3>
            <p className="text-muted-foreground text-xs">
              You are on the free plan. Upgrade to unlock more bots, team members, and features.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Free
          </Badge>
        </div>
      </div>
    </div>
  );
}
