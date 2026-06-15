import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password input with a show/hide toggle. Spreads all native input props and
 * forwards the ref, so it works directly with react-hook-form's `register`.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(function PasswordInput({ className, ...props }, ref) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        tabIndex={-1}
        className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Sembunyikan password" : "Lihat password"}
        aria-pressed={show}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
});
