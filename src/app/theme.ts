import { createTheme } from "@mui/material/styles";

export const appColors = {
  primary: "#005883",
  background: "#FFFFFF",
  section: "#F6F5F4",
  text: "#000000",
  textMuted: "#333333",
  textOnDark: "#FFFFFF",
  link: "#005883",
  border: "color-mix(in srgb, #333333 24%, #FFFFFF)",
};

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: appColors.primary,
      contrastText: appColors.textOnDark,
    },
    secondary: {
      main: appColors.textMuted,
      contrastText: appColors.textOnDark,
    },
    error: {
      main: appColors.textMuted,
      contrastText: appColors.textOnDark,
    },
    warning: {
      main: appColors.textMuted,
      contrastText: appColors.textOnDark,
    },
    info: {
      main: appColors.primary,
      contrastText: appColors.textOnDark,
    },
    success: {
      main: appColors.primary,
      contrastText: appColors.textOnDark,
    },
    background: {
      default: appColors.background,
      paper: appColors.section,
    },
    text: {
      primary: appColors.text,
      secondary: appColors.textMuted,
    },
    divider: appColors.border,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: appColors.background,
        },
        body: {
          backgroundColor: appColors.background,
          color: appColors.text,
        },
        a: {
          color: appColors.link,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          textTransform: "none",
          "&.MuiButton-contained": {
            backgroundColor: appColors.primary,
            color: appColors.textOnDark,
            "&:hover": {
              backgroundColor: appColors.primary,
            },
            "&.Mui-disabled": {
              backgroundColor: appColors.section,
              color: appColors.textMuted,
            },
          },
          "&.MuiButton-outlined": {
            backgroundColor: appColors.background,
            borderColor: appColors.primary,
            color: appColors.primary,
            "&:hover": {
              backgroundColor: appColors.section,
              borderColor: appColors.primary,
            },
            "&.Mui-disabled": {
              backgroundColor: appColors.background,
              borderColor: appColors.section,
              color: appColors.textMuted,
            },
          },
          "&.MuiButton-text": {
            color: appColors.primary,
            "&:hover": {
              backgroundColor: appColors.section,
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: appColors.textMuted,
          "&.Mui-focused": {
            color: appColors.primary,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: appColors.background,
          color: appColors.text,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: appColors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: appColors.primary,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: appColors.primary,
          },
          "&.Mui-disabled": {
            backgroundColor: appColors.section,
            color: appColors.textMuted,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: appColors.textMuted,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: appColors.textMuted,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: appColors.text,
          "&.Mui-selected": {
            backgroundColor: appColors.section,
            color: appColors.primary,
          },
          "&.Mui-selected:hover": {
            backgroundColor: appColors.section,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: appColors.background,
          border: `1px solid ${appColors.border}`,
          boxShadow: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: appColors.background,
          borderBottomColor: appColors.border,
          color: appColors.text,
        },
        head: {
          color: appColors.primary,
          fontWeight: 700,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: appColors.background,
          color: appColors.text,
          boxShadow: "none",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: appColors.section,
          color: appColors.text,
          "& .MuiAlert-icon": {
            color: appColors.textMuted,
          },
          "&.MuiAlert-colorInfo .MuiAlert-icon, &.MuiAlert-colorSuccess .MuiAlert-icon": {
            color: appColors.primary,
          },
        },
      },
    },
  },
});
