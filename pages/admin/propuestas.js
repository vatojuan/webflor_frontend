// pages/admin/propuestas.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  TextField,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function PropuestasPage({ toggleDarkMode, currentMode }) {
  const { user, loading: loadingAuth } = useAdminAuth();
  const [proposals, setProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [refresh, setRefresh] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";
  const token = typeof window !== "undefined" && localStorage.getItem("adminToken");

  // ─── Fetch propuestas ───────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) return;

    const fetchProposals = async () => {
      setLoadingProposals(true);
      try {
        const res = await fetch(`${API_URL}/api/proposals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) throw new Error("No autorizado");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProposals(Array.isArray(data.proposals) ? data.proposals : []);
      } catch (err) {
        console.error("Error al obtener propuestas:", err);
        setSnackbar({ open: true, message: err.message, severity: "error" });
      } finally {
        setLoadingProposals(false);
      }
    };

    fetchProposals();
  }, [user, token, refresh]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const filtered = proposals.filter(p =>
    p.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Enviar propuesta ───────────────────────────────────────────
  const handleSendProposal = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/proposals/${id}/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      setSnackbar({ open: true, message: "Propuesta enviada", severity: "success" });
      setRefresh(f => !f);
    } catch (err) {
      console.error("Error al enviar propuesta:", err);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  // ─── Ver detalle ────────────────────────────────────────────────
  const openDetail = (p) => { setSelectedProposal(p); setOpenDetailDialog(true); };
  const closeDetail = () => { setSelectedProposal(null); setOpenDetailDialog(false); };

  if (loadingAuth || loadingProposals) {
    return (
      <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  if (!user || !token) return null;

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Propuestas</Typography>

        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <TextField
            label="Buscar oferta o postulante"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {["ID","Oferta","Postulante","Etiqueta","Estado","Creado","Acciones"].map(h =>
                  <TableCell key={h}>{h}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.job_title}</TableCell>
                  <TableCell>{p.applicant_name}</TableCell>
                  <TableCell>{p.label === "manual" ? "Manual" : "Automático"}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("es-AR", {
                      dateStyle: "short", timeStyle: "short"
                    }).format(new Date(p.created_at))}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => openDetail(p)} sx={{ mr: 1 }}>
                      Ver
                    </Button>
                    {p.label === "manual" && p.status === "pending" && (
                      <Button size="small" variant="contained"
                        onClick={() => handleSendProposal(p.id)}
                      >
                        Enviar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay propuestas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDetailDialog} onClose={closeDetail} fullWidth maxWidth="md">
        <DialogTitle>Detalle de la Propuesta</DialogTitle>
        <DialogContent dividers>
          {selectedProposal && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                ["ID", selectedProposal.id],
                ["Oferta", selectedProposal.job_title],
                ["Postulante", `${selectedProposal.applicant_name} (${selectedProposal.applicant_email})`],
                ["Etiqueta", selectedProposal.label === "manual"? "Manual":"Automático"],
                ["Fuente", selectedProposal.source],
                ["Estado", selectedProposal.status],
                ["Creado", new Intl.DateTimeFormat("es-AR", {
                  dateStyle:"full", timeStyle:"medium"
                }).format(new Date(selectedProposal.created_at))],
                selectedProposal.sent_at && [
                  "Enviado", new Intl.DateTimeFormat("es-AR", {
                    dateStyle:"full", timeStyle:"medium"
                  }).format(new Date(selectedProposal.sent_at))
                ],
                selectedProposal.notes && ["Notas", selectedProposal.notes]
              ].filter(Boolean).map(([label,val]) => (
                <Typography key={label}>
                  <strong>{label}:</strong> {val}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical:"bottom", horizontal:"center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export async function getServerSideProps(){
  return { props: {} };
}
