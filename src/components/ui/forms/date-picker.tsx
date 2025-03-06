'use client';

import * as React from 'react';
import { format, isValid, parse, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';

// Types
type DatePickerType = 'single' | 'range';

interface DatePickerBaseProps {
  /**
   * Type of date picker
   * @default 'single'
   */
  type?: DatePickerType;
  /**
   * Label for the date picker
   */
  label?: string;
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Whether the date picker is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Custom class for the container
   */
  className?: string;
  /**
   * Custom class for the input
   */
  inputClassName?: string;
  /**
   * Custom class for the calendar
   */
  calendarClassName?: string;
  /**
   * Date format string
   * @default 'PP' (e.g., 'Apr 29, 2023')
   */
  dateFormat?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the date picker is required
   * @default false
   */
  required?: boolean;
  /**
   * Whether to show the clear button
   * @default true
   */
  clearable?: boolean;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
}

interface SingleDatePickerProps extends DatePickerBaseProps {
  type?: 'single';
  /**
   * Selected date
   */
  selected?: Date;
  /**
   * Called when date changes
   */
  onSelect?: (date?: Date | undefined) => void;
}

interface RangeDatePickerProps extends DatePickerBaseProps {
  type: 'range';
  /**
   * Selected date range
   */
  selected?: DateRange;
  /**
   * Called when date range changes
   */
  onSelect?: (range?: DateRange) => void;
}

export type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

export function DatePicker(props: DatePickerProps) {
  const {
    type = 'single',
    label,
    helperText,
    error,
    disabled = false,
    className,
    inputClassName,
    calendarClassName,
    dateFormat = 'PP',
    placeholder = 'Select date',
    required = false,
    clearable = true,
    minDate,
    maxDate,
  } = props;
  
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    if (!isValid(date)) return '';
    return format(date, dateFormat);
  };
  
  // Format date range for display
  const formatDateRange = (from?: Date, to?: Date): string => {
    if (!from) return '';
    if (!to) return formatDate(from);
    return `${formatDate(from)} - ${formatDate(to)}`;
  };
  
  // Parse date from input
  const parseDate = (value: string): Date | undefined => {
    try {
      const parsedDate = parse(value, dateFormat, new Date());
      if (isValid(parsedDate)) return parsedDate;
      return undefined;
    } catch (error) {
      return undefined;
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (type === 'single' && 'onSelect' in props) {
      const date = parseDate(value);
      if (date && props.onSelect) {
        props.onSelect(date as any);
      }
    }
    // For range, we don't try to parse from input
  };
  
  // Handle clear
  const handleClear = () => {
    setInputValue('');
    if (type === 'single' && 'onSelect' in props && props.onSelect) {
      props.onSelect(undefined);
    } else if (type === 'range' && 'onSelect' in props && props.onSelect) {
      props.onSelect(undefined);
    }
  };
  
  // Helper function to check if a value is a DateRange
  const isDateRange = (value: any): value is DateRange => {
    return value && ('from' in value || 'to' in value);
  };
  
  // Update input value when selected date changes
  React.useEffect(() => {
    if (type === 'single' && 'selected' in props && props.selected) {
      if (props.selected instanceof Date) {
        setInputValue(formatDate(props.selected));
      }
    } else if (type === 'range' && 'selected' in props && props.selected) {
      if (isDateRange(props.selected)) {
        const { from, to } = props.selected;
        if (from) {
          setInputValue(formatDateRange(from, to));
        } else {
          setInputValue('');
        }
      }
    } else {
      setInputValue('');
    }
  }, [props, dateFormat, type]);
  
  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Determine if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && isBefore(date, startOfDay(minDate))) return true;
    if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
    return false;
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            inputClassName
          )}
          rightIcon={
            <div className="flex items-center">
              {clearable && inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear date</span>
                </Button>
              )}
              <CalendarIcon className="h-4 w-4" />
            </div>
          }
        />
        
        {/* Calendar Popover */}
        {open && !disabled && (
          <div
            ref={calendarRef}
            className={cn(
              "absolute z-50 mt-2 bg-popover text-popover-foreground rounded-md border shadow-md p-3",
              "animate-in fade-in-0 zoom-in-95",
              calendarClassName
            )}
          >
            {type === 'single' ? (
              <DayPicker
                mode="single"
                selected={props.type === 'single' ? props.selected : undefined}
                onSelect={(date) => {
                  if (props.type === 'single' && props.onSelect) {
                    props.onSelect(date);
                    setOpen(false);
                  }
                }}
                disabled={isDateDisabled}
                className="p-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    "hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  ),
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            ) : (
              <DayPicker
                mode="range"
                selected={props.type === 'range' ? props.selected : undefined}
                onSelect={(range) => {
                  if (props.type === 'range' && props.onSelect) {
                    props.onSelect(range);
                    if (range?.from && range?.to) {
                      setOpen(false);
                    }
                  }
                }}
                disabled={isDateDisabled}
                className="p-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    "hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  ),
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Helper text or error */}
      {(helperText || error) && (
        <p className={cn(
          "text-xs",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export default DatePicker; 