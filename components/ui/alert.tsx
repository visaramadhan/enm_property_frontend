import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-card border p-4 text-sm [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-info/30 bg-info/8 text-ink",
        success: "border-success/30 bg-success/8 text-ink",
        warning: "border-warning/40 bg-warning/10 text-ink",
        danger: "border-danger/30 bg-danger/8 text-ink",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

const ikon: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, React.ElementType> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

const warnaIkon: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /** Sembunyikan ikon bawaan bila panel sudah memakai ikon sendiri. */
    tanpaIkon?: boolean;
  };

function Alert({ className, variant = "info", tanpaIkon = false, children, ...props }: AlertProps) {
  const Ikon = ikon[variant ?? "info"];

  return (
    <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {tanpaIkon ? null : (
        <Ikon className={cn("mt-0.5", warnaIkon[variant ?? "info"])} aria-hidden="true" />
      )}
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="alert-title" className={cn("font-semibold text-ink", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-description" className={cn("text-[13px] text-ink-muted", className)} {...props} />
  );
}

export { Alert, AlertDescription, AlertTitle };
