import { Paper, type PaperProps, type SxProps, type Theme } from "@mui/material";

type SectionCardProps = PaperProps & {
  sx?: SxProps<Theme>;
  tone?: "default" | "action";
};

const baseSectionCardSx: SxProps<Theme> = {
  p: 2,
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
};

const actionSectionCardSx: SxProps<Theme> = {
  bgcolor: "primary.main",
  borderColor: "primary.main",
  color: "primary.contrastText",
  "& .MuiAlert-root": {
    bgcolor: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.28)",
    color: "primary.contrastText",
  },
  "& .MuiAlert-icon, & .MuiAlert-message": {
    color: "primary.contrastText",
  },
  "& .MuiButton-root.MuiButton-contained.MuiButton-colorPrimary, & .MuiButton-root.MuiButton-outlined.MuiButton-colorPrimary":
    {
      bgcolor: "primary.contrastText",
      borderColor: "primary.contrastText",
      color: "primary.main",
    },
  "& .MuiButton-root.MuiButton-contained.MuiButton-colorPrimary:hover, & .MuiButton-root.MuiButton-outlined.MuiButton-colorPrimary:hover":
    {
      bgcolor: "#f5fbff",
      borderColor: "#f5fbff",
      color: "primary.main",
    },
  "& .MuiButton-root.MuiButton-contained.Mui-disabled, & .MuiButton-root.MuiButton-outlined.Mui-disabled":
    {
      bgcolor: "rgba(255, 255, 255, 0.24)",
      borderColor: "rgba(255, 255, 255, 0.24)",
      color: "rgba(255, 255, 255, 0.72)",
    },
  "& .MuiButton-root.MuiButton-contained.MuiButton-colorSecondary, & .MuiButton-root.MuiButton-outlined.MuiButton-colorSecondary":
    {
      bgcolor: "primary.contrastText",
      borderColor: "primary.contrastText",
      color: "primary.main",
    },
};

export function SectionCard({
  sx,
  tone = "default",
  ...props
}: SectionCardProps) {
  return (
    <Paper
      {...props}
      sx={[
        baseSectionCardSx,
        tone === "action" ? actionSectionCardSx : {},
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}
