import { cn } from "@/lib/utils";

export function Logo({ url, className }: { url: string; className?: string }) {
  return (
    <img
      src={url}
      alt="Logo"
      title="Logo"
      width={96}
      height={96}
      className={cn("size-8 rounded-md", className)}
    />
  );
}
