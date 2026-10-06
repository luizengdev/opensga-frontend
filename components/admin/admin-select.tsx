"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminSelectItem {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: AdminSelectItem[];
  placeholder?: string;
  disabled?: boolean;
}

export const AdminSelect = ({
  value,
  onValueChange,
  items,
  placeholder,
  disabled,
}: AdminSelectProps) => {
  const selectedLabel = items.find((item) => item.value === value)?.label;

  return (
    <Select
      disabled={disabled}
      items={items}
      onValueChange={(next) => {
        if (typeof next === "string" && next.length > 0) {
          onValueChange(next);
        }
      }}
      value={value || null}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {() => selectedLabel ?? placeholder ?? ""}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} label={item.label} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
