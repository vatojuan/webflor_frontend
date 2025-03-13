import React, { useState } from "react";
import useAdminAuth from "../../hooks/useAdminAuth";
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Snackbar,
  CssBaseline,
  LinearProgress,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Head from "next/head";

export default function AdminAgregarCV() {
  // Verifica autenticación de administrador
  useAdminAuth();

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

  const clearResults = () => {
    setResults([]);
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
        clearResults();
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 2
            }}
          >
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
            {uploading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinearProgress sx={{ flex: 1 }} />
                <Typography variant="body2">Procesando archivos...</Typography>
              </Box>
            )}
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
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">Resultados del proceso</Typography>
                <IconButton onClick={clearResults} title="Limpiar logs">
                  <DeleteIcon />
                </IconButton>
              </Box>
              {results.map((result, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardHeader
                    avatar={
                      result.status === "success" ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )
                    }
                    title={`${result.file} ${
                      result.email ? `(Email: ${result.email})` : ""
                    }`}
                    subheader={result.message}
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Logs del proceso:
                    </Typography>
                    <List dense>
                      {result.logs &&
                        result.logs.map((log, i) => (
                          <ListItem key={i}>
                            <ListItemText primary={log} />
                          </ListItem>
                        ))}
                    </List>
                  </CardContent>
                </Card>
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
