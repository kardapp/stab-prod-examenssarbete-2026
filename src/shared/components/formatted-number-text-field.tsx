"use client";

import {
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { TextField, type TextFieldProps } from "@mui/material";

type TextFieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type TextFieldFocusEvent = FocusEvent<HTMLInputElement | HTMLTextAreaElement>;

export type FormattedNumberTextFieldProps = Omit<TextFieldProps, "type">;

export function FormattedNumberTextField({
  value,
  onChange,
  onFocus,
  onBlur,
  slotProps,
  ...props
}: FormattedNumberTextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextField
      {...props}
      type="text"
      value={isFocused ? stringifyValue(value) : formatNumberTextFieldValue(value)}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event as TextFieldFocusEvent);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event as TextFieldFocusEvent);
      }}
      onChange={(event) =>
        onChange?.(
          createNormalizedChangeEvent(
            event,
            normalizeNumberTextFieldValue(event.target.value)
          )
        )
      }
      slotProps={{
        ...slotProps,
        htmlInput: {
          inputMode: "decimal",
          ...slotProps?.htmlInput,
        },
      }}
    />
  );
}

function createNormalizedChangeEvent(
  event: TextFieldChangeEvent,
  value: string
): TextFieldChangeEvent {
  return {
    ...event,
    target: {
      ...event.target,
      value,
    },
    currentTarget: {
      ...event.currentTarget,
      value,
    },
  } as TextFieldChangeEvent;
}

function normalizeNumberTextFieldValue(value: string): string {
  const compactValue = value.replace(/\s/g, "").replace(/,/g, ".");
  const sign = compactValue.trim().startsWith("-") ? "-" : "";
  const unsignedValue = compactValue.replace(/-/g, "");
  const [integerPart = "", ...decimalParts] = unsignedValue.split(".");
  const integerDigits = integerPart.replace(/[^\d]/g, "");
  const decimalDigits = decimalParts.join("").replace(/[^\d]/g, "");

  return decimalParts.length > 0
    ? `${sign}${integerDigits}.${decimalDigits}`
    : `${sign}${integerDigits}`;
}

function formatNumberTextFieldValue(value: TextFieldProps["value"]): string {
  const normalizedValue = normalizeNumberTextFieldValue(stringifyValue(value));

  if (!normalizedValue) {
    return "";
  }

  const [integerPart, decimalPart] = normalizedValue.split(".");
  const formattedInteger = formatIntegerPart(integerPart);

  return decimalPart === undefined
    ? formattedInteger
    : `${formattedInteger}.${decimalPart}`;
}

function formatIntegerPart(value: string): string {
  const sign = value.startsWith("-") ? "-" : "";
  const unsignedValue = sign ? value.slice(1) : value;

  return `${sign}${unsignedValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
}

function stringifyValue(value: TextFieldProps["value"]): string {
  return value === undefined || value === null ? "" : String(value);
}
