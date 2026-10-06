"use client";

import {Search} from "lucide-react";

import {Input} from "@/components/ui/input";

interface AdminSearchFieldProps {
  onValueChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export const AdminSearchField = ({
  onValueChange,
  placeholder,
  value,
}: AdminSearchFieldProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
      <Input
        className="pl-9"
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
};
