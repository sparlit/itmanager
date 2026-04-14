"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

interface ComboboxInputProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboboxInput({
  options,
  value,
  onChange,
  placeholder = "Type or select...",
  emptyMessage = "No options found",
  className,
  disabled = false,
}: ComboboxInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Sync external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = React.useMemo(() => {
    if (!inputValue.trim()) return options;
    const lower = inputValue.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        opt.value.toLowerCase().includes(lower)
    );
  }, [options, inputValue]);

  function handleSelect(option: ComboboxOption) {
    setInputValue(option.label);
    onChange(option.value);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    // Keep popover open while typing
    if (!open) setOpen(true);
  }

  function handleFocus() {
    setOpen(true);
    // Select all text on focus for easy replacement
    setTimeout(() => inputRef.current?.select(), 50);
  }

  function handleBlur(e: React.FocusEvent) {
    // Delay close to allow click on option
    setTimeout(() => {
      setOpen(false);
      // Sync the input with the current value
      setInputValue(value);
    }, 200);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter") {
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <Popover open={open && filteredOptions.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pr-8 rounded-lg text-[13px] border-slate-200",
              className
            )}
          />
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] rounded-lg border-slate-200 shadow-lg z-[60]"
        align="start"
        sideOffset={4}
        ref={popoverRef}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[220px] overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-slate-400">{emptyMessage}</p>
              <p className="text-[11px] text-slate-300 mt-1">
                Press Enter to use your typed value
              </p>
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left hover:bg-slate-50 transition-colors cursor-pointer",
                  (option.label.toLowerCase() === inputValue.toLowerCase() ||
                    option.value === value) &&
                    "bg-emerald-50/50"
                )}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur from firing before click
                  handleSelect(option);
                }}
              >
                <span className="flex-1 truncate text-slate-700">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {option.description}
                  </span>
                )}
                {(option.label.toLowerCase() === inputValue.toLowerCase() ||
                  option.value === value) && (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
        {filteredOptions.length > 0 && (
          <div className="border-t border-slate-100 px-3 py-1.5 bg-slate-50/50">
            <p className="text-[10px] text-slate-400">
              Type a custom value or select from list
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
