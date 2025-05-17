// pages/admin/mis_ofertas.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

/* ══════════════════════════════════════
   Utils
   ══════════════════════════════════════ */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";
const fmtDate  = (d) => (d ? new Date(d).toLocaleDateString("es-AR") : "—");
const fmtLabel = (l) => (l === "manual" ? "Manual" : "Automático");

/* ══════════════════════════════════════
   Page Component
   ══════════════════════════════════════ */
export default function MisOfertas({ toggleDarkMode, currentMode }) {
  const { user, loading } = useAdminAuth();

  const [offers, setOffers] = useState([]);
  const [sel, setSel] = useState(null);              // editing offer
  const [busy, setBusy] = useState(false);           // fetch / action flag
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  /* ————————————————————————————————————
     Auth headers
     ———————————————————————————————————— */
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  /* ————————————————————————————————————
     Fetch offers
     ———————————————————————————————————— */
  const fetchOffers = () => {
    if (!user || !token) return;
    setBusy(true);
    fetch(`${API_URL}/api/job/admin_offers`, { headers })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => setOffers(Array.isArray(j.offers) ? j.offers : []))
      .catch((e) =>
        setSnack({ open: true, msg: "Error obteniendo ofertas", sev: "error" })
      )
      .finally(() => setBusy(false));
  };

  useEffect(fetchOffers, [user, token]);

  /* ————————————————————————————————————
     Delete
     ———————————————————————————————————— */
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta oferta?")) return;
    try {
      const r = await fetch(`${API_URL}/api/job/delete-admin`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ jobId: id }),
      });
      if (!r.ok) throw new Error((await r.json()).detail ?? `HTTP ${r.status}`);
      setOffers((prev) => prev.filter((o) => o.id !== id));
      setSnack({ open: true, msg: "Oferta eliminada", sev: "success" });
    } catch (e) {
      setSnack({ open: true, msg: e.message, sev: "error" });
    }
  };

  /* ————————————————————————————————————
     Update
     ———————————————————————————————————— */
  const updateSel = (k, v) => setSel((old) => ({ ...old, [k]: v }));
  const handleSave = async () => {
    try {
      const r = await fetch(`${API_URL}/api/job/update-admin`, {
        method: "PUT",
        headers,
        body: JSON.stringify(sel),
      });
      if (!r.ok) throw new Error((await r.json()).detail ?? `HTTP ${r.status}`);
      const updated = await r.json();
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSnack({ open: true, msg: "Oferta actualizada", sev: "success" });
      setSel(null);
    } catch (e) {
      setSnack({ open: true, msg: e.message, sev: "error" });
    }
  };

  /* ————————————————————————————————————
     Render
     ———————————————————————————————————— */
  if (loading || busy)
    return (
      <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  if (!user || !token) return null;

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mis ofertas de trabajo
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  "Título",
                  "Descripción",
                  "Requisitos",
                  "Expira",
                  "Etiqueta",
                  "Fuente",
                  "Acciones",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay ofertas
                  </TableCell>
                </TableRow>
              )}
              {offers.map((o) => (
                <TableRow
                  key={o.id}
                  sx={{
                    backgroundColor: o.userId === user.id ? "#FFFDE7" : "inherit",
                  }}
                >
                  <TableCell>{o.title}</TableCell>
                  <TableCell>{o.description}</TableCell>
                  <TableCell>{o.requirements}</TableCell>
                  <TableCell>{fmtDate(o.expirationDate)}</TableCell>
                  <TableCell>
                    <Chip label={fmtLabel(o.label)} size="small" />
                  </TableCell>
                  <TableCell>{o.source ?? "—"}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSel(o)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(o.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* ══ Diálogo Edición ══ */}
      <Dialog open={Boolean(sel)} onClose={() => setSel(null)} fullWidth>
        <DialogTitle>Editar oferta</DialogTitle>
        <DialogContent dividers>
          {sel && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Título"
                fullWidth
                value={sel.title}
                onChange={(e) => updateSel("title", e.target.value)}
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                value={sel.description}
                onChange={(e) => updateSel("description", e.target.value)}
              />
              <TextField
                label="Requisitos"
                fullWidth
                multiline
                rows={2}
                value={sel.requirements}
                onChange={(e) => updateSel("requirements", e.target.value)}
              />
              <TextField
                label="Fecha de expiración"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={sel.expirationDate ? sel.expirationDate.slice(0, 10) : ""}
                onChange={(e) => updateSel("expirationDate", e.target.value)}
              />
              <TextField
                select
                label="Etiqueta"
                SelectProps={{ native: true }}
                value={sel.label}
                onChange={(e) => updateSel("label", e.target.value)}
              >
                <option value="automatic">Automático</option>
                <option value="manual">Manual</option>
              </TextField>
              <TextField
                select
                label="Fuente"
                SelectProps={{ native: true }}
                value={sel.source}
                onChange={(e) => updateSel("source", e.target.value)}
              >
                <option value="admin">Administrador</option>
                <option value="employer">Empleador</option>
                <option value="instagram">Instagram</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSel(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Snackbar ══ */}
      <Snackbar
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
