import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

export default function Container({
  className,
  children,
}: {
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("container", "mx-auto max-w-7xl", className)}>
      {children}
    </div>
  );
}
