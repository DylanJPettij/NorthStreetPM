import { useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

type DateRange = { from: Date; to: Date };

interface DateRangePickerProps {
  from: Date;
  to: Date;
  open: boolean;
  onClose: () => void;
  onChange: (from: Date, to: Date) => void;
}

export default function DateRangePicker({
  from,
  to,
  open,
  onClose,
  onChange,
}: DateRangePickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) return;
    if (range.from && range.to) {
      onChange(range.from, range.to);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div ref={ref} className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-2">
        <DayPicker
          mode="range"
          selected={{ from, to }}
          onSelect={
            handleSelect as (
              range: { from?: Date; to?: Date } | undefined,
            ) => void
          }
          numberOfMonths={2}
        />
      </div>
    </div>
  );
}
