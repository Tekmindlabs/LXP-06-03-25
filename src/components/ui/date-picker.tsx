"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/atoms/label"

export interface DatePickerProps {
  value?: Date
  onChange?: (date?: Date) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
  error?: string
  helperText?: string
  required?: boolean
  fromDate?: Date
  toDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  disabled,
  className,
  error,
  helperText,
  required,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [inputValue, setInputValue] = React.useState<string>(
    value ? format(value, "PP") : ""
  )
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  // Update the input value when the date changes
  React.useEffect(() => {
    if (value) {
      setDate(value)
      setInputValue(format(value, "PP"))
    } else {
      setDate(undefined)
      setInputValue("")
    }
  }, [value])

  // Handle date selection from calendar
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      setInputValue(format(selectedDate, "PP"))
    }
    onChange?.(selectedDate)
    setIsPopoverOpen(false)
  }

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Try to parse the date
    if (value) {
      try {
        const parsedDate = parse(value, "PP", new Date())
        if (isValid(parsedDate)) {
          setDate(parsedDate)
        }
      } catch (error) {
        // Invalid date format, don't update the date
      }
    } else {
      setDate(undefined)
    }
  }

  // Handle input blur
  const handleInputBlur = () => {
    if (inputValue) {
      try {
        // Try multiple common date formats
        const formats = ["PP", "yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy"]
        let parsedDate: Date | undefined

        for (const fmt of formats) {
          try {
            const date = parse(inputValue, fmt, new Date())
            if (isValid(date)) {
              parsedDate = date
              break
            }
          } catch (error) {
            // Try next format
          }
        }

        if (parsedDate) {
          setDate(parsedDate)
          setInputValue(format(parsedDate, "PP"))
          onChange?.(parsedDate)
        } else {
          // If we couldn't parse the date, reset to the current value
          if (date) {
            setInputValue(format(date, "PP"))
          } else {
            setInputValue("")
          }
        }
      } catch (error) {
        // If there's an error, reset to the current value
        if (date) {
          setInputValue(format(date, "PP"))
        } else {
          setInputValue("")
        }
      }
    } else {
      setDate(undefined)
      onChange?.(undefined)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleInputBlur()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pr-10",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              disabled={disabled}
              type="button"
            >
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(date) => {
              const isBeforeMin = fromDate ? date < fromDate : false
              const isAfterMax = toDate ? date > toDate : false
              return isBeforeMin || isAfterMax || disabled === true
            }}
            initialFocus
          />
          <div className="border-t p-3 text-xs text-muted-foreground">
            <p>Format: MM/DD/YYYY</p>
            <p>Type directly or use the calendar</p>
          </div>
        </PopoverContent>
      </Popover>
      {(helperText || error) && (
        <p
          className={cn(
            "text-xs",
            error ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
} 
