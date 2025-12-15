import { useMemo } from "react";
import { TextInput } from "@mantine/core";
import { parseCommaListSmart, stringifyCommaListSmart } from "../utils/listParsing";

export function DeferredCommaListInput({
  label,
  placeholder,
  disabled,
  values,
  onCommit,
  resetKey,
}: {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  values: string[];
  onCommit: (next: string[]) => void;
  resetKey: string | number;
}) {
  const defaultValue = useMemo(() => stringifyCommaListSmart(values), [values]);

  return (
    <TextInput
      key={resetKey}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={defaultValue}
      onBlur={(e) => onCommit(parseCommaListSmart(e.currentTarget.value))}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const target = e.currentTarget as HTMLInputElement;
        onCommit(parseCommaListSmart(target.value));
      }}
    />
  );
}


