import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-field border border-line bg-surface px-3 py-2 text-sm text-ink",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-out outline-none",
        "placeholder:text-ink-subtle",
        "hover:bg-hover",
        "focus:border-primary focus:bg-surface focus:ring-[3px] focus:ring-primary/20",
        "aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:ring-danger/20",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-surface",
        "file:mr-3 file:h-8 file:rounded-field file:border-0 file:bg-secondary file:px-3 file:text-[13px] file:font-medium file:text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
