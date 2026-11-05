import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-field border border-line bg-surface px-3 py-2 text-sm text-ink",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-out outline-none",
        "placeholder:text-ink-subtle",
        "hover:bg-hover",
        "focus:border-primary focus:bg-surface focus:ring-[3px] focus:ring-primary/20",
        "aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:ring-danger/20",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
