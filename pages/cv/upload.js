import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  CssBaseline,
  LinearProgress,
} from "@mui/material";

export default function UploadCVPage() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [embedding, setEmbedding] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // Función que realiza la subida del archivo
  const uploadFile = async (selectedFile) => {
    if (!selectedFile) {
      setMessage("Por favor selecciona un archivo.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (email) formData.append("email", email.toLowerCase());

    setUploading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cv/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage(res.data.message || "CV procesado exitosamente.");
      if (res.data.extracted_text) {
        setExtractedText(res.data.extracted_text);
      }
      if (res.data.embedding) {
        setEmbedding(res.data.embedding);
      }
      setSnackbar({
        open: true,
        severity: "success",
        message: "CV procesado correctamente.",
      });
    } catch (error) {
      console.error("Error subiendo el CV:", error.response?.data || error.message);
      setMessage("Error subiendo el CV.");
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error subiendo el CV.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Al seleccionar un archivo, se guarda y se sube automáticamente
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  return (
    <>
      <Head>
        <title>Subir CV - Webflor IA</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Subir tu CV
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="contained" component="label">
              Seleccionar Archivo (PDF o DOCX)
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <TextField
              label="Email (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              fullWidth
              helperText="Si el CV contiene más de un email o deseas vincular tu CV a otro correo, especifica el email aquí."
            />
            {uploading && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
          {message && (
            <Alert
              severity={message.includes("Error") ? "error" : "success"}
              sx={{ mt: 2 }}
            >
              {message}
            </Alert>
          )}
          {extractedText && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Texto extraído:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  maxHeight: 200,
                  overflow: "auto",
                  backgroundColor: "background.paper",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {extractedText}
                </Typography>
              </Paper>
            </Box>
          )}
          {embedding && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Embedding generado:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  maxHeight: 200,
                  overflow: "auto",
                  backgroundColor: "background.paper",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(embedding, null, 2)}
                </Typography>
              </Paper>
            </Box>
          )}
        </Paper>
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
      </Container>
    </>
  );
}
