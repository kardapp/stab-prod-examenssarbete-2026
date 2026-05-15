import { Alert } from "@mui/material";

type ValidationMessageProps = {
  message?: string;
};

export function ValidationMessage(props: ValidationMessageProps) {
  if (!props.message) {
    return null;
  }

  return (
    <Alert severity="error" sx={{ mt: 1.5 }}>
      {props.message}
    </Alert>
  );
}
