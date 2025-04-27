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

  // Fetch propuestas
  useEffect(() => {
    if (!user) return;

    const fetchProposals = async () => {
      setLoadingProposals(true);
      try {
        const res = await fetch(`${API_URL}/api/proposals/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProposals(Array.isArray(data.proposals) ? data.proposals : []);
      } catch (err) {
        console.error("Error al obtener propuestas:", err);
        setSnackbar({ open: true, message: "Error al obtener propuestas", severity: "error" });
      } finally {
        setLoadingProposals(false);
      }
    };

    fetchProposals();
  }, [user, refresh]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProposals = proposals.filter((p) =>
    p.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendProposal = async (proposalId) => {
    try {
      const res = await fetch(`${API_URL}/api/proposals/${proposalId}/send/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || res.statusText);
      }
      setSnackbar({ open: true, message: "Propuesta enviada", severity: "success" });
      setRefresh((r) => !r);
    } catch (error) {
      console.error("Error al enviar propuesta:", error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: "error" });
    }
  };

  const handleOpenDetail = (proposal) => {
    setSelectedProposal(proposal);
    setOpenDetailDialog(true);
  };
  const handleCloseDetail = () => {
    setSelectedProposal(null);
    setOpenDetailDialog(false);
  };

  if (loadingAuth || loadingProposals) {
    return (
      <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  if (!user) return null;

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Propuestas
        </Typography>

        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <TextField
            label="Buscar por oferta o postulante"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {["ID", "Oferta", "Postulante", "Etiqueta", "Status", "Fecha", "Acciones"].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProposals.length > 0 ? (
                filteredProposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.job_title}</TableCell>
                    <TableCell>{p.applicant_name}</TableCell>
                    <TableCell>{p.label}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(p.created_at))}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleOpenDetail(p)} sx={{ mr: 1 }}>
                        Ver
                      </Button>
                      {p.label === "manual" && p.status === "pending" && (
                        <Button size="small" variant="contained" onClick={() => handleSendProposal(p.id)}>
                          Enviar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron propuestas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDetailDialog} onClose={handleCloseDetail} fullWidth maxWidth="md">
        <DialogTitle>Detalle de la Propuesta</DialogTitle>
        <DialogContent dividers>
          {selectedProposal && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries({
                ID: selectedProposal.id,
                Oferta: selectedProposal.job_title,
                Postulante: `${selectedProposal.applicant_name} (${selectedProposal.applicant_email})`,
                Etiqueta: selectedProposal.job_label,
                Fuente: selectedProposal.source,
                Estado: selectedProposal.status,
                "Creado el": new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "full",
                  timeStyle: "medium",
                }).format(new Date(selectedProposal.created_at)),
                ...(selectedProposal.sent_at && {
                  "Enviado el": new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "full",
                    timeStyle: "medium",
                  }).format(new Date(selectedProposal.sent_at)),
                }),
                ...(selectedProposal.notes ? { Notas: selectedProposal.notes } : {}),
              }).map(([label, value]) => (
                <Typography key={label}>
                  <strong>{label}:</strong> {value}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
