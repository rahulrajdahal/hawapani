import React, { ComponentPropsWithRef, forwardRef } from "react";

/**
 * Props for the Base Input component.
 * Extends standard HTML input attributes and optionally supports debounced updates.
 */
export interface InputProps extends Omit<
  ComponentPropsWithRef<"input">,
  "value"
> {
  /** Controlled input value */
  value?: string | number;
  /** Optional debounce delay in milliseconds before calling onChangeValue */
  debounce?: number;
  /** Optional callback fired with the updated debounced value */
  onChangeValue?: (value: string | number) => void;
}

export default forwardRef(function Input(
  {
    debounce,
    value: controlledValue,
    onChangeValue,
    onChange,
    "aria-label": ariaLabel,
    placeholder,
    ...props
  }: Readonly<InputProps>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const [internalValue, setInternalValue] = React.useState<string | number>(
    controlledValue ?? "",
  );

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  React.useEffect(() => {
    if (debounce === undefined || debounce <= 0 || !onChangeValue) return;

    const timeout = setTimeout(() => {
      onChangeValue(internalValue);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChangeValue, internalValue]);

  const computedAriaLabel = ariaLabel || placeholder || "Input field";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInternalValue(nextVal);
    onChange?.(e);

    if (onChangeValue && (debounce === undefined || debounce <= 0)) {
      onChangeValue(nextVal);
    }
  };

  return (
    <input
      {...props}
      ref={ref}
      placeholder={placeholder}
      aria-label={computedAriaLabel}
      value={internalValue}
      onChange={handleChange}
    />
  );
});
