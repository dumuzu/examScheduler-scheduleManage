import * as React from "react"
import { format } from "date-fns"
import ja from "date-fns/locale/ja"
import enUS from "date-fns/locale/en-US"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from "./components"

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  language?: 'en' | 'ja';
  className?: string;
  label?: string;
  error?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, language = 'ja', className, label, error, placeholder }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Parse 'YYYY-MM-DD' to Date object. Append T00:00:00 to ensure local day match.
  const date = value ? new Date(value + 'T00:00:00') : undefined;

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Format back to 'YYYY-MM-DD'
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
      setOpen(false); // Auto-close on selection
    } else {
      onChange('');
    }
  };

  const locale = language === 'ja' ? ja : enUS;

  return (
    <div className={cn("w-full", className)}>
        {label && <label className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</label>}
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            type="button" 
            className={cn(
                "w-full justify-start text-left font-normal border-zinc-200 shadow-none hover:bg-white bg-white h-9 px-3",
                !date && "text-zinc-500"
            )}
            >
            <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
            {date ? format(date, "PPP", { locale }) : <span className="text-zinc-500">{placeholder || (language === 'ja' ? '日付を選択' : 'Pick a date')}</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
              locale={locale}
              defaultMonth={date || new Date()}
            />
        </PopoverContent>
        </Popover>
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}