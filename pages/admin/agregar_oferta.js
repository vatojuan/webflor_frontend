// pages/admin/agregar_oferta.js

import { useState } from "react";
import { useRouter } from "next/router";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Snackbar, 
  Alert, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function AgregarOferta() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const adminUserId = user?.id || 1;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [expirationOption, setExpirationOption] = useState("");
  const [manualExpirationDate, setManualExpirationDate] = useState("");

  const [label, setLabel] = useState("automatic");
  const [source, setSource] = useState("admin");
  const [isPaid, setIsPaid] = useState(false);

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  if (loading) {
    return <Typography align="center" sx={{ mt: 4 }}>Cargando...</Typography>;
  }
  if (!user) return null;

  const computeExpirationDate = () => {
    const now = new Date();
    switch (expirationOption) {
      case "24h": now.setHours(now.getHours() + 24); break;
      case "3d":  now.setDate(now.getDate() + 3);     break;
      case "7d":  now.setDate(now.getDate() + 7);     break;
      case "15d": now.setDate(now.getDate() + 15);    break;
      case "1m":  now.setMonth(now.getMonth() + 1);   break;
      case "manual":
        return manualExpirationDate ? new Date(manualExpirationDate) : null;
      default:
        return null;
    }
    return now;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expirationDate = expirationOption ? computeExpirationDate() : null;
    const token = localStorage.getItem("adminToken");
    const finalLabel = isPaid ? "manual" : label;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/create-admin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          requirements,
          expirationDate: expirationDate ? expirationDate.toISOString() : null,
          userId: adminUserId,
          label: finalLabel,
          source,
          isPaid,
          contactEmail,
          contactPhone,
        }),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: "Oferta publicada", severity: "success" });
        setTimeout(() => router.push("/admin/mis_ofertas"), 2000);
      } else {
        const data = await res.json();
        setSnackbar({ open: true, message: "Error: " + (data.detail || data.message), severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Error al publicar oferta", severity: "error" });
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h4" gutterBottom>Publicar Oferta de Empleo</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Título" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
          <TextField label="Descripción" value={description} onChange={e => setDescription(e.target.value)} required multiline rows={4} fullWidth />
          <TextField label="Requisitos" value={requirements} onChange={e => setRequirements(e.target.value)} required multiline rows={3} fullWidth />

          <FormControl fullWidth>
            <InputLabel id="expiration-option-label">Expiración</InputLabel>
            <Select labelId="expiration-option-label" label="Expiración" value={expirationOption} onChange={e => setExpirationOption(e.target.value)}>
              <MenuItem value="24h">24 horas</MenuItem>
              <MenuItem value="3d">3 días</MenuItem>
              <MenuItem value="7d">7 días</MenuItem>
              <MenuItem value="15d">15 días</MenuItem>
              <MenuItem value="1m">1 mes</MenuItem>
              <MenuItem value="manual">Fecha manual</MenuItem>
            </Select>
          </FormControl>
          {expirationOption === "manual" && (
            <TextField
              label="Fecha de Expiración"
              type="date"
              value={manualExpirationDate}
              onChange={e => setManualExpirationDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          )}

          <FormControl fullWidth>
            <InputLabel id="label-option-label">Etiqueta</InputLabel>
            <Select labelId="label-option-label" label="Etiqueta" value={label} onChange={e => setLabel(e.target.value)} disabled={isPaid}>
              <MenuItem value="automatic">Automático</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="source-option-label">Fuente</InputLabel>
            <Select labelId="source-option-label" label="Fuente" value={source} onChange={e => setSource(e.target.value)}>
              <MenuItem value="employer">Empleador</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="red_social">Red Social</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Email de Contacto (opcional)"
            type="email"
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Teléfono de Contacto (opcional)"
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            fullWidth
          />

          <FormControlLabel
            control={<Checkbox checked={isPaid} onChange={e => setIsPaid(e.target.checked)} color="primary" />}
            label="Oferta pagada (posicionamiento y asesoría)"
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">Publicar Oferta</Button>
            <Button variant="outlined" onClick={() => router.push("/admin/dashboard")}>Cancelar</Button>
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}

// Forzar SSR
export async function getServerSideProps() {
  return { props: {} };
}
