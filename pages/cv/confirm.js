// pages/cv/confirm.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { Container, Paper, Typography, CssBaseline } from "@mui/material";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const { code } = router.query;
  const [message, setMessage] = useState("Procesando confirmación...");

  useEffect(() => {
    if (code) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/cv/confirm?code=${code}`)
        .then(() => {
          setMessage("✅ ¡Cuenta confirmada exitosamente!");
          setTimeout(() => {
            window.location.href = "https://fapmendoza.com/login";
          }, 3000);
        })
        .catch((error) => {
          console.error("❌ Error al confirmar:", error);
          setMessage("❌ Error al confirmar la cuenta.");
        });
    }
  }, [code]);

  return (
    <>
      <Head>
        <title>Confirmación de Email - Webflor IA</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Confirmación de Email
          </Typography>
          <Typography variant="body1">{message}</Typography>
        </Paper>
      </Container>
    </>
  );
}
