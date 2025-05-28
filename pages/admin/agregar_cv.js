// frontend/pages/admin/agregar_cv.js
import React, { useState } from "react";
import useAdminAuth from "../../hooks/useAdminAuth";
import DashboardLayout from "../../components/DashboardLayout";
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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  ClearAll as ClearAllIcon,
  ExpandMore as ExpandMoreIcon,
  HighlightOff as HighlightOffIcon
} from "@mui/icons-material";
import axios from "axios";
import Head from "next/head";

export default function AdminAgregarCV({ toggleDarkMode, currentMode }) {
  useAdminAuth();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileProgress, setFileProgress] = useState({});
  const [results, setResults] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: ""
  });

  const handleFilesChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  const clearResults = () => {
    setResults([]);
    setFileProgress({});
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setSnackbar({ open: true, severity: "error", message: "Selecciona al menos un archivo." });
      return;
    }
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setSnackbar({ open: true, severity: "error", message: "Usuario no autenticado." });
      return;
    }

    setUploading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin_upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (event) => {
            const total = event.total || 1;
            const percent = Math.round((event.loaded * 100) / total);
            setUploadProgress(percent);
          }
        }
      );

      const data = res.data.results;
      setResults(data);
      setSnackbar({ open: true, severity: "success", message: "CVs procesados correctamente." });
      // Inicializar progresos individuales
      const prog = {};
      data.forEach((r, i) => { prog[i] = 100; });
      setFileProgress(prog);

      setTimeout(clearResults, 60000);
      clearSelection();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, severity: "error", message: "Error procesando los CVs." });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Head>
        <title>Agregar CVs - Administrador</title>
      </Head>
      <CssBaseline />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Agregar CVs
          </Typography>

          {/* Selección de archivos */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Seleccionar CVs
              <input
                type="file"
                accept=".pdf"
                multiple
                hidden
                onChange={handleFilesChange}
              />
            </Button>
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <List>
                  {selectedFiles.map((file, idx) => (
                    <ListItem
                      key={idx}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeFile(idx)}>
                          <HighlightOffIcon color="error" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearAllIcon />}
                    onClick={clearSelection}
                  >
                    Limpiar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={uploadFiles}
                    startIcon={<CloudUploadIcon />}
                  >
                    Subir CVs
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {/* Progreso global */}
          {uploading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <LinearProgress sx={{ flex: 1 }} variant="determinate" value={uploadProgress} />
              <Typography variant="body2">{uploadProgress}%</Typography>
            </Box>
          )}

          {/* Resultados y Logs */}
          {results.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">Resultados</Typography>
                <IconButton onClick={clearResults} title="Limpiar logs">
                  <DeleteIcon />
                </IconButton>
              </Box>

              {results.map((result, idx) => (
                <Card key={idx} sx={{ mb: 2 }}>
                  <CardHeader
                    avatar={
                      result.status === "success" ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )
                    }
                    title={`${result.file} ${result.email ? `(${result.email})` : ""}`}
                    subheader={result.message}
                  />
                  <Divider />
                  <CardContent>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">Ver logs</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {result.logs.map((log, i) => (
                          <Typography key={i} variant="body2" paragraph>
                            {log}
                          </Typography>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
