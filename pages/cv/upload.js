// pages/upload-cv.js
import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import MainLayout from "../components/MainLayout";

export default function UploadCVPage() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", message: "" });
  const [extractedText, setExtractedText] = useState("");
  const [embedding, setEmbedding] = useState(null);

  const uploadFile = async (selectedFile) => {
    if (!selectedFile) {
      setSnackbar({ open: true, severity: "warning", message: "Por favor selecciona un archivo." });
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (email) formData.append("email", email.toLowerCase());

    setUploading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cv/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage(res.data.message || "CV procesado exitosamente.");
      setSnackbar({
        open: true,
        severity: "success",
        message: "CV procesado. Revisa tu correo (spam incluido).",
      });
      if (res.data.extracted_text) setExtractedText(res.data.extracted_text);
      if (res.data.embedding) setEmbedding(res.data.embedding);
    } catch (error) {
      console.error("Error subiendo el CV:", error);
      setSnackbar({ open: true, severity: "error", message: "Error al subir el CV." });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) uploadFile(selected);
  };

  return (
    <>
      <Head>
        <title>Subí tu CV — Webflor IA</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        {/* Hero */}
        <Box
          sx={{
            background: "linear-gradient(135deg,#0B2A2D 0%,#103B40 50%,#155158 100%)",
            color: "#FFF",
            py: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="sm" sx={{ textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              ¡Bienvenido a Webflor IA!
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Subí tu CV
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 2 }}>
              En pocos segundos analizamos tu currículum y generamos una descripción profesional.
            </Typography>
          </Container>
        </Box>

        {/* Formulario */}
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderTop: "6px solid #D96236",
              backgroundColor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Button variant="contained" component="label" size="large">
                Seleccionar CV (PDF o DOCX)
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>

              <TextField
                label="Correo electrónico (opcional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Asociamos tu CV a este email si lo deseas."
                fullWidth
              />

              {uploading && <LinearProgress />}

              {message && (
                <Alert severity={message.includes("Error") ? "error" : "success"}>
                  {message}
                </Alert>
              )}
            </Box>
          </Paper>

          {/* Resultados de extracción */}
          {extractedText && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" gutterBottom color="common.white">
                Texto extraído
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  maxHeight: 240,
                  overflow: "auto",
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", color: "text.primary" }}
                >
                  {extractedText}
                </Typography>
              </Paper>
            </Box>
          )}

          {embedding && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom color="common.white">
                Embedding generado
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  maxHeight: 240,
                  overflow: "auto",
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", color: "text.primary" }}
                >
                  {JSON.stringify(embedding, null, 2)}
                </Typography>
              </Paper>
            </Box>
          )}
        </Container>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </MainLayout>
    </>
  );
}
