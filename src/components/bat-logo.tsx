import { cn } from "@/lib/utils";

export function BatLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className={cn("w-48 h-24", className)}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 6.34C2.87 5.1 4.28 2.45 4.7 0h14.6c.42 2.45 1.83 5.1 4.7 6.34-2.87 1.25-4.28 3.9-4.7 6.35H4.7C4.28 10.24 2.87 7.59 0 6.34z" />
    </svg>
  );
}
