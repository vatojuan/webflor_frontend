import { useState, useEffect } from "react";
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
  FormControl 
} from "@mui/material";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function AgregarOferta() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  // Definimos el ID fijo para el admin
  const adminUserId = 1;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [expirationOption, setExpirationOption] = useState("");
  const [manualExpirationDate, setManualExpirationDate] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  if (loading) {
    return <Typography align="center" sx={{ mt: 4 }}>Cargando...</Typography>;
  }

  if (!user) {
    return null;
  }

  const computeExpirationDate = () => {
    const now = new Date();
    switch (expirationOption) {
      case "24h":
        now.setHours(now.getHours() + 24);
        return now;
      case "3d":
        now.setDate(now.getDate() + 3);
        return now;
      case "7d":
        now.setDate(now.getDate() + 7);
        return now;
      case "15d":
        now.setDate(now.getDate() + 15);
        return now;
      case "1m":
        now.setMonth(now.getMonth() + 1);
        return now;
      case "manual":
        return manualExpirationDate ? new Date(manualExpirationDate) : null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // En lugar de usar user.id, usamos el ID fijo para admin
    const expirationDate = expirationOption ? computeExpirationDate() : null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          requirements,
          expirationDate: expirationDate ? expirationDate.toISOString() : null,
          userId: adminUserId,
        }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Oferta publicada", severity: "success" });
        setTimeout(() => router.push("/admin/mis_ofertas"), 2000);
      } else {
        const data = await res.json();
        setSnackbar({ open: true, message: "Error al publicar oferta: " + data.message, severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error al publicar oferta", severity: "error" });
    }
  };

  const handleCancel = () => {
    router.push("/admin/dashboard");
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Publicar Oferta de Empleo
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          multiline
          rows={4}
          fullWidth
        />
        <TextField
          label="Requisitos"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          required
          multiline
          rows={3}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="expiration-option-label">Expiración</InputLabel>
          <Select
            labelId="expiration-option-label"
            label="Expiración"
            value={expirationOption}
            onChange={(e) => setExpirationOption(e.target.value)}
          >
            <MenuItem value="24h">24 horas</MenuItem>
            <MenuItem value="3d">3 días</MenuItem>
            <MenuItem value="7d">7 días</MenuItem>
            <MenuItem value="15d">15 días</MenuItem>
            <MenuItem value="1m">1 mes</MenuItem>
            <MenuItem value="manual">Poner fecha manualmente</MenuItem>
          </Select>
        </FormControl>
        {expirationOption === "manual" && (
          <TextField
            label="Fecha de Expiración"
            type="date"
            value={manualExpirationDate}
            onChange={(e) => setManualExpirationDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Publicar Oferta
          </Button>
          <Button variant="outlined" onClick={handleCancel} sx={{ color: "text.primary", borderColor: "text.primary" }}>
            Cancelar
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Forzar SSR para evitar problemas de prerendering
export async function getServerSideProps() {
  return { props: {} };
}
