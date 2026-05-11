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
          border: "1px solid #d0d7de",
          borderRadius: 1,
          boxShadow: "none",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}
