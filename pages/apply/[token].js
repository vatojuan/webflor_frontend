// pages/apply/[token].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function ApplyPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/apply/${token}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center", minHeight: "60vh" }}>
      {status === "loading" ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Confirmando tu postulación…</Typography>
        </Box>
      ) : status === "success" ? (
        <Alert severity="success">
          ¡Tu postulación fue confirmada correctamente! Gracias por tu interés.
        </Alert>
      ) : (
        <Alert severity="error">
          Hubo un problema al confirmar tu postulación. El enlace ya se usó o es inválido.
        </Alert>
      )}
    </Container>
  );
}

// 👉 Solución para evitar errores de prerendering en el build de Vercel
export const getServerSideProps = () => {
  return {
    props: {},
  };
};
