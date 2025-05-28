// pages/_app.js
import '@mui/x-data-grid/material.css';   //  ✅  único import necesario
import '../styles/globals.css';

import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('adminColorMode');
    if (saved) setMode(saved);
  }, []);

  const toggleDark = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('adminColorMode', next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#D96236', dark: '#B0482B' },
          secondary: { main: '#103B40' },
          background: {
            default: mode === 'light' ? '#F2E6CE' : '#2B1B17',
            paper: mode === 'light' ? '#FFFFFF' : '#3E2723',
          },
          text: {
            primary: mode === 'light' ? '#3E2723' : '#FAD9CF',
            secondary: mode === 'light' ? '#5D4037' : '#D7CCC8',
          },
        },
        typography: {
          fontFamily: "'Bodoni Moda', serif",
        },
      }),
    [mode]
  );

  return (
    <>
      <Head>
        <title>Dashboard Administrativo - FAP Mendoza</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} toggleDarkMode={toggleDark} currentMode={mode} />
      </ThemeProvider>
    </>
  );
}
