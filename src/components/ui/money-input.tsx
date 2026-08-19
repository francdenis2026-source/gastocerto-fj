import * as React from "react";

import { Input } from "@/components/ui/input";
import { amountToInput, maskAmountInput } from "@/lib/money-input";
import { cn } from "@/lib/utils";

type MoneyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "defaultValue" | "type"
> & {
  value?: string;
  onValueChange?: (masked: string) => void;
  defaultValue?: number | string | null;
};

export function MoneyInput({
  value,
  onValueChange,
  defaultValue,
  className,
  ...rest
}: MoneyInputProps) {
  const controlled = value !== undefined && onValueChange !== undefined;
  const [internal, setInternal] = React.useState(() =>
    value !== undefined ? value : amountToInput(defaultValue ?? ""),
  );

  const current = controlled ? (value as string) : internal;

  return (
    <Input
      {...rest}
      inputMode="decimal"
      autoComplete="off"
      value={current}
      aria-label={rest["aria-label"] ?? rest.placeholder ?? "Valor em reais"}
      onChange={(event) => {
        const masked = maskAmountInput(event.target.value);
        if (controlled) onValueChange?.(masked);
        else setInternal(masked);
      }}
      className={cn("font-medium tabular-nums", className)}
    />
  );
}
