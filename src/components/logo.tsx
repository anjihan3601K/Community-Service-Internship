import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c-2 0-4-1-4.5-2.5-1.5-1-2.5-3-2.5-5 0-4.5 4.5-8 10-8s10 3.5 10 8c0 2-1 4-2.5 5C16 21 14 22 12 22z" fill="hsl(var(--primary))" opacity="0.3" />
      <path d="M12 2a5 5 0 0 0-5 5c0 1.6.8 3 2 4" stroke="hsl(var(--primary))" />
      <path d="M12 2a5 5 0 0 1 5 5c0 1.6-.8 3-2 4" stroke="hsl(var(--primary))" />
      <path d="M2 12h20" stroke="hsl(var(--accent))" strokeWidth="1" />
    </svg>
  );
}
