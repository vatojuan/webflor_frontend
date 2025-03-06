// pages/_app.js
import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const storedMode = localStorage.getItem("colorMode");
    if (storedMode) {
      setMode(storedMode);
    } else {
      setMode(prefersDarkMode ? "dark" : "light");
    }
  }, [prefersDarkMode]);

  const toggleDarkMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("colorMode", newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#D96236",
            dark: "#B0482B",
          },
          secondary: {
            main: "#103B40",
          },
          accent: {
            main: "#2F4F4F",
          },
          background: {
            default: mode === "light" ? "#F2E6CE" : "#2B1B17",
            paper: mode === "light" ? "#FFFFFF" : "#3E2723",
          },
          text: {
            primary: mode === "light" ? "#3E2723" : "#FAD9CF",
            secondary: mode === "light" ? "#5D4037" : "#D7CCC8",
            accent: "#2F4F4F",
          },
        },
        typography: {
          fontFamily: "'Bodoni Moda', serif",
          h1: { fontWeight: 700, fontSize: "2.4rem" },
          h2: { fontWeight: 600, fontSize: "2rem" },
          h6: { fontWeight: 500 },
          body1: { fontSize: "1rem", lineHeight: 1.6 },
        },
      }),
    [mode]
  );

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>FAP Mendoza</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} toggleDarkMode={toggleDarkMode} currentMode={mode} />
      </ThemeProvider>
    </>
  );
}
