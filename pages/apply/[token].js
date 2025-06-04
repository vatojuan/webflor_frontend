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
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apply/${token}`);
        if (!res.ok) {
          throw new Error("Error al confirmar postulación");
        }
        const data = await res.json();
        if (data.success && data.token) {
          // Guardamos el JWT del candidato en localStorage
          localStorage.setItem("userToken", data.token);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  // Redirigir a /job-list 2 segundos después de éxito
  useEffect(() => {
    if (status === "success") {
      const timeoutId = setTimeout(() => {
        window.location.href = "https://www.fapmendoza.com/job-list";
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [status]);

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 8, textAlign: "center", minHeight: "60vh" }}
    >
      {status === "loading" ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Confirmando tu postulación…</Typography>
        </Box>
      ) : status === "success" ? (
        <Alert severity="success">
          ¡Tu postulación fue confirmada correctamente! <br />
          Serás redirigido al listado de ofertas…
        </Alert>
      ) : (
        <Alert severity="error">
          Hubo un problema al confirmar tu postulación. El enlace ya se usó o es inválido.
        </Alert>
      )}
    </Container>
  );
}

// Evitamos prerendering en Vercel
export const getServerSideProps = () => {
  return { props: {} };
};
