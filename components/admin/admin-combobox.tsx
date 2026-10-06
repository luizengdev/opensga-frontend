"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface AdminComboboxItem {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
}

interface AdminComboboxProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  items: AdminComboboxItem[];
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
}

const RESULT_LIMIT = 50;

const matchesQuery = (item: AdminComboboxItem, query: string) => {
  const termo = query.trim().toLowerCase();

  if (termo.length === 0) {
    return true;
  }

  const haystack = [item.label, item.description, item.keywords]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase();

  return haystack.includes(termo);
};

export const AdminCombobox = ({
  id,
  value,
  onValueChange,
  items,
  placeholder = "Buscar…",
  disabled,
  emptyText = "Nenhum resultado encontrado.",
}: AdminComboboxProps) => {
  const selected = items.find((item) => item.value === value) ?? null;

  return (
    <Combobox
      disabled={disabled}
      id={id}
      filter={matchesQuery}
      isItemEqualToValue={(a, b) => a.value === b.value}
      items={items}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      limit={RESULT_LIMIT}
      onValueChange={(next) => {
        onValueChange(next?.value ?? "");
      }}
      value={selected}
    >
      <ComboboxInput className="w-full" placeholder={placeholder} showClear />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: AdminComboboxItem) => (
            <ComboboxItem key={item.value} value={item}>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{item.label}</span>
                {item.description ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
