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

  // Si la postulación fue exitosa, redirigimos al listado de ofertas en 3 segundos
  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => {
        router.push("/job-list");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 8, textAlign: "center", minHeight: "60vh" }}
    >
      {status === "loading" ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Confirmando tu postulación…</Typography>
        </Box>
      ) : status === "success" ? (
        <Alert severity="success">
          ¡Tu postulación fue confirmada correctamente! <br />
          Te redirigiremos al listado de ofertas en breve…
        </Alert>
      ) : (
        <Alert severity="error">
          Hubo un problema al confirmar tu postulación. El enlace ya se usó o es
          inválido.
        </Alert>
      )}
    </Container>
  );
}

// 👉 Evitar el error de prerendering en Vercel
export const getServerSideProps = () => {
  return {
    props: {},
  };
};
