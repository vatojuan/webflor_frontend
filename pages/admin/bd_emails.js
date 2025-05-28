import { useState, useEffect } from "react";
import {
  Tabs, Tab, Box, Button, Typography, TextField, Paper, Container,
  List, ListItem, ListItemText, LinearProgress, Snackbar, Alert,
  Card, CardHeader, CardContent, Divider, IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";
import axios from "axios";

export default function BdEmails() {
  useAdminAuth();                              // protección de ruta

  const [tab, setTab] = useState(0);

  /* ---------- TAB 0: IMPORTAR ---------- */
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /* ---------- TAB 1: MANUAL ---------- */
  const [manual, setManual] = useState({ email: "", name: "", phone: "", notes: "" });

  /* ---------- TAB 2: LISTADO & MAILING ---------- */
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [mail, setMail] = useState({ subject: "", body: "" });

  /* ---------- SNACKBAR ---------- */
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  /* ---------- API ---------- */
  const apiRoot  = process.env.NEXT_PUBLIC_API_URL;
  const emailApi = `${apiRoot}/api/admin/emails`;
  const token    = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers  = { Authorization: `Bearer ${token}` };

  /* ---------- Utils ---------- */
  const handleSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  /* ---------- Importar archivos ---------- */
  const handleFileSelect = (e) => setFiles(Array.from(e.target.files));

  const uploadFiles = async () => {
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    setUploading(true);
    try {
      const { data } = await axios.post(`${emailApi}/admin_emails_upload`, fd, {
        headers,
        onUploadProgress: (e) => setProgress(Math.round((100 * e.loaded) / e.total)),
      });
      setResults(data.results);
      handleSnack("Archivos procesados");
      setFiles([]);
    } catch {
      handleSnack("Error procesando archivos", "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /* ---------- Alta manual ---------- */
  const addManual = async () => {
    if (!manual.email) return handleSnack("E-mail requerido", "error");
    try {
      await axios.post(`${emailApi}/admin_emails_manual`, manual, { headers });
      handleSnack("Contacto agregado");
      setManual({ email: "", name: "", phone: "", notes: "" });
    } catch (err) {
      handleSnack(err.response?.data?.detail || "Error", "error");
    }
  };

  /* ---------- Listado ---------- */
  const fetchRows = async () => {
    setLoadingRows(true);
    try {
      const { data } = await axios.get(`${emailApi}/admin_emails`, {
        params: { search, page: 1, page_size: 500 },
        headers,
      });
      setRows(
        data.items.map((r) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          phone: r.phone,
          notes: r.notes,
          source: r.source,
          imported_at: r.imported_at,
        }))
      );
    } catch {
      handleSnack("Error cargando filas", "error");
    } finally {
      setLoadingRows(false);
    }
  };
  useEffect(() => { if (tab === 2) fetchRows(); }, [tab]); // eslint-disable-line

  const updateRow = async ({ id, field, value }) => {
    try {
      await axios.put(`${emailApi}/admin_emails/${id}`, { [field]: value }, { headers });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    } catch {
      handleSnack("Error actualizando", "error");
    }
  };

  const deleteRow = async (id) => {
    try {
      await axios.delete(`${emailApi}/admin_emails/${id}`, { headers });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      handleSnack("Error eliminando", "error");
    }
  };

  /* ---------- Enviar mailing ---------- */
  const sendBulk = async () => {
    if (!mail.subject || !mail.body) return handleSnack("Asunto y cuerpo requeridos", "error");
    try {
      await axios.post(
        `${emailApi}/admin_emails/send_bulk`,
        { subject: mail.subject, body: mail.body, ids: selection.length ? selection : undefined },
        { headers }
      );
      handleSnack("E-mails encolados para envío");
      setMail({ subject: "", body: "" });
    } catch {
      handleSnack("Error enviando", "error");
    }
  };

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            BD E-mails
          </Typography>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
            <Tab label="Importar archivos" />
            <Tab label="Añadir manual" />
            <Tab label="Listado & Mailing" />
          </Tabs>

          {/* ---------- TAB 0 ---------- */}
          {tab === 0 && (
            <>
              <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                Seleccionar archivos
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
              </Button>

              {files.length > 0 && (
                <Box mt={2}>
                  <List dense>
                    {files.map((f) => (
                      <ListItem key={f.name}>
                        <ListItemText primary={f.name} />
                      </ListItem>
                    ))}
                  </List>
                  <Button onClick={uploadFiles} variant="contained">
                    Procesar
                  </Button>
                </Box>
              )}

              {uploading && (
                <Box mt={2}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography>{progress}%</Typography>
                </Box>
              )}

              {results.length > 0 && (
                <Box mt={4}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Resultados</Typography>
                    <IconButton onClick={() => setResults([])}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  {results.map((r, i) => (
                    <Card key={i} sx={{ my: 2 }}>
                      <CardHeader title={`${r.file} – ${r.email || "sin email"}`} subheader={r.status} />
                      <Divider />
                      <CardContent>
                        <List dense>
                          {r.logs.map((l, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={l} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}

          {/* ---------- TAB 1 ---------- */}
          {tab === 1 && (
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
              <TextField label="E-mail*" value={manual.email} onChange={(e) => setManual({ ...manual, email: e.target.value })} />
              <TextField label="Nombre"  value={manual.name}  onChange={(e) => setManual({ ...manual, name: e.target.value })} />
              <TextField label="Teléfono" value={manual.phone} onChange={(e) => setManual({ ...manual, phone: e.target.value })} />
              <TextField label="Notas" multiline rows={3} value={manual.notes} onChange={(e) => setManual({ ...manual, notes: e.target.value })} />
              <Button variant="contained" onClick={addManual}>Guardar</Button>
            </Box>
          )}

          {/* ---------- TAB 2 ---------- */}
          {tab === 2 && (
            <>
              <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                <TextField label="Buscar email / nombre" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
                <Button variant="contained" onClick={fetchRows}>Buscar</Button>
              </Box>

              <div style={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={[
                    { field: "email", headerName: "E-mail", flex: 1, editable: false },
                    { field: "name",  headerName: "Nombre", flex: 1, editable: true },
                    { field: "phone", headerName: "Teléfono", flex: 1, editable: true },
                    { field: "notes", headerName: "Notas", flex: 1, editable: true },
                    {
                      field: "actions",
                      headerName: "",
                      width: 80,
                      renderCell: (params) => (
                        <IconButton onClick={() => deleteRow(params.row.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      ),
                    },
                  ]}
                  checkboxSelection
                  disableSelectionOnClick
                  onCellEditCommit={updateRow}
                  onSelectionModelChange={(ids) => setSelection(ids)}
                  loading={loadingRows}
                />
              </div>

              {/* Formulario de mailing */}
              <Box sx={{ mt: 3, maxWidth: 600, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6">
                  Enviar mailing {selection.length ? `(solo ${selection.length} seleccionados)` : "(a toda la base)"}
                </Typography>
                <TextField label="Asunto" value={mail.subject} onChange={(e) => setMail({ ...mail, subject: e.target.value })} />
                <TextField label="Cuerpo" multiline rows={6} value={mail.body} onChange={(e) => setMail({ ...mail, body: e.target.value })} />
                <Button variant="contained" startIcon={<SendIcon />} onClick={sendBulk}>Enviar</Button>
              </Box>
            </>
          )}
        </Paper>

        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
