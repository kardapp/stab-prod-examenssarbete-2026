import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";

type KarolinskaThemeProps = {
  children: ReactNode;
};

/**
 * Karolinska branded MUI theme.
 *
 * Source reference:
 * https://centuri.karolinska.se/RegNo/K06252
 *
 * The app should use this theme above all MUI components. Keep page-level
 * styling local with MUI `sx`, but source shared colors, typography and
 * component defaults from this file.
 */
export const karolinskaColors = {
  darkBlue: "#005883",
  blue: "#00A3E0",
  white: "#FFFFFF",
  lightGrey: "#F6F5F4",
  borderGrey: "#CECECE",
  textBlack: "#000000",
  textMuted: "#333333",
  accessibleGrey: "#67696B",
  accessibleBlue: "#0071C9",
  red: "#9E1B34",
  orange: "#E54800",
  yellow: "#FFCE00",
  darkGreen: "#00574F",
} as const;

export const karolinskaTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: karolinskaColors.darkBlue,
      contrastText: karolinskaColors.white,
    },
    secondary: {
      main: karolinskaColors.orange,
      contrastText: karolinskaColors.white,
    },
    error: {
      main: karolinskaColors.red,
      contrastText: karolinskaColors.white,
    },
    warning: {
      main: karolinskaColors.orange,
      contrastText: karolinskaColors.white,
    },
    info: {
      main: karolinskaColors.blue,
      contrastText: karolinskaColors.white,
    },
    success: {
      main: karolinskaColors.darkGreen,
      contrastText: karolinskaColors.white,
    },
    background: {
      default: karolinskaColors.white,
      paper: karolinskaColors.lightGrey,
    },
    text: {
      primary: karolinskaColors.textBlack,
      secondary: karolinskaColors.textMuted,
    },
    divider: karolinskaColors.borderGrey,
  },
  typography: {
    fontFamily: '"Open Sans", Arial, sans-serif',
    allVariants: {
      fontFamily: '"Open Sans", Arial, sans-serif',
      letterSpacing: 0,
    },
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: karolinskaColors.white,
        },
        body: {
          backgroundColor: karolinskaColors.white,
          color: karolinskaColors.textBlack,
          fontFamily: '"Open Sans", Arial, sans-serif',
        },
        a: {
          color: karolinskaColors.darkBlue,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderTop: `3px solid ${karolinskaColors.blue}`,
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
            backgroundColor: karolinskaColors.darkBlue,
            color: karolinskaColors.white,
            "&:hover": {
              backgroundColor: karolinskaColors.darkBlue,
            },
            "&.Mui-disabled": {
              backgroundColor: karolinskaColors.lightGrey,
              color: karolinskaColors.textMuted,
            },
          },
          "&.MuiButton-outlined": {
            backgroundColor: karolinskaColors.white,
            borderColor: karolinskaColors.darkBlue,
            color: karolinskaColors.darkBlue,
            "&:hover": {
              backgroundColor: karolinskaColors.lightGrey,
              borderColor: karolinskaColors.darkBlue,
            },
            "&.Mui-disabled": {
              backgroundColor: karolinskaColors.white,
              borderColor: karolinskaColors.lightGrey,
              color: karolinskaColors.textMuted,
            },
          },
          "&.MuiButton-text": {
            color: karolinskaColors.darkBlue,
            "&:hover": {
              backgroundColor: karolinskaColors.lightGrey,
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: karolinskaColors.textMuted,
          "&.Mui-focused": {
            color: karolinskaColors.darkBlue,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: karolinskaColors.white,
          color: karolinskaColors.textBlack,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: karolinskaColors.borderGrey,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: karolinskaColors.darkBlue,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: karolinskaColors.darkBlue,
          },
          "&.Mui-disabled": {
            backgroundColor: karolinskaColors.lightGrey,
            color: karolinskaColors.textMuted,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: karolinskaColors.textMuted,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: karolinskaColors.textMuted,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: karolinskaColors.textBlack,
          "&.Mui-selected": {
            backgroundColor: karolinskaColors.lightGrey,
            color: karolinskaColors.darkBlue,
          },
          "&.Mui-selected:hover": {
            backgroundColor: karolinskaColors.lightGrey,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: karolinskaColors.white,
          border: `1px solid ${karolinskaColors.borderGrey}`,
          boxShadow: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: karolinskaColors.white,
          borderBottomColor: karolinskaColors.borderGrey,
          color: karolinskaColors.textBlack,
        },
        head: {
          color: karolinskaColors.darkBlue,
          fontWeight: 700,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: karolinskaColors.white,
          color: karolinskaColors.textBlack,
          boxShadow: "none",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: karolinskaColors.lightGrey,
          color: karolinskaColors.textBlack,
          "& .MuiAlert-icon": {
            color: karolinskaColors.textMuted,
          },
          "&.MuiAlert-colorInfo .MuiAlert-icon": {
            color: karolinskaColors.blue,
          },
          "&.MuiAlert-colorSuccess .MuiAlert-icon": {
            color: karolinskaColors.darkGreen,
          },
          "&.MuiAlert-colorWarning .MuiAlert-icon": {
            color: karolinskaColors.orange,
          },
          "&.MuiAlert-colorError .MuiAlert-icon": {
            color: karolinskaColors.red,
          },
        },
      },
    },
  },
});

export function KarolinskaTheme({ children }: KarolinskaThemeProps) {
  return (
    <ThemeProvider theme={karolinskaTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
