import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium [&_svg]:pointer-events-none [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        /* Badge paket: bg Accent, teks Text Primary (kontras 7.7:1) */
        accent: "border-transparent bg-accent text-accent-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-success/12 text-success",
        warning: "border-transparent bg-warning/14 text-warning",
        danger: "border-transparent bg-danger/12 text-danger",
        info: "border-transparent bg-info/12 text-info",
        neutral: "border-transparent bg-divider text-ink-muted",
        outline: "border-line bg-surface text-ink-muted",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
