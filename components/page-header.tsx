import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  backHref?: string;
}

export function PageHeader({ title, description, children, backHref }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center gap-2">
        {backHref && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
