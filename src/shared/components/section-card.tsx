import { Paper, type PaperProps, type SxProps, type Theme } from "@mui/material";

type SectionCardProps = PaperProps & {
  sx?: SxProps<Theme>;
};

export function SectionCard({ sx, ...props }: SectionCardProps) {
  return (
    <Paper
      {...props}
      sx={[
        {
          p: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          boxShadow: "none",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}
