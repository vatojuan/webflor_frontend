import React, { useState } from "react";
import useAdminAuth from "../../hooks/useAdminAuth"; // Asegúrate de la ruta correcta
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  CssBaseline,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import Head from "next/head";

export default function AdminAgregarCV() {
  useAdminAuth(); // Verifica autenticación de administrador

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: ""
  });

  const handleFilesChange = (e) => {
    setFiles(e.target.files);
  };

  const uploadFiles = async () => {
    if (!files || files.length === 0) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Por favor, selecciona al menos un archivo."
      });
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    setUploading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cv/admin_upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResults(res.data.results);
      setSnackbar({
        open: true,
        severity: "success",
        message: "CVs procesados correctamente."
      });
      // Auto-limpia los logs después de 60 segundos
      setTimeout(() => {
        setResults([]);
      }, 60000);
    } catch (error) {
      console.error("Error en la carga de CVs", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error procesando los CVs."
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Agregar CVs - Administrador</title>
      </Head>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Agregar CVs
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="contained" component="label">
              Seleccionar CVs (PDF)
              <input
                type="file"
                accept=".pdf"
                multiple
                hidden
                onChange={handleFilesChange}
              />
            </Button>
            {uploading && <LinearProgress />}
            <Button
              variant="contained"
              color="primary"
              onClick={uploadFiles}
              disabled={uploading}
            >
              Subir CVs
            </Button>
          </Box>
          {results.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Resultados:
              </Typography>
              {results.map((result, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {result.file}: {result.message}{" "}
                      {result.email ? `(Email: ${result.email})` : ""}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {result.logs &&
                        result.logs.map((log, i) => (
                          <ListItem key={i}>
                            <ListItemText primary={log} />
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
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
