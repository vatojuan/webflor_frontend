import React, { useState, useEffect, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Snackbar,
  Alert,
  Chip,
  Stack,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

const API = process.env.NEXT_PUBLIC_API_URL;

const PLACEHOLDERS = [
  { label: "Postulante", code: "{{applicant_name}}" },
  { label: "Oferta",     code: "{{job_title}}" },
  { label: "Empleador",  code: "{{employer_name}}" },
  { label: "Email CV",   code: "{{cv_url}}" },
  { label: "Fecha",      code: "{{created_at}}" },
  // ...añade los que necesites
];

export default function TemplatesPage({ toggleDarkMode, currentMode }) {
  const { user, loading } = useAdminAuth();
  const [templates, setTemplates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snackbar, setSnackbar] = useState({ open:false, message:"", severity:"success" });

  const nameRef    = useRef();
  const typeRef    = useRef();
  const subjectRef = useRef();   // 🆕
  const contentRef = useRef();
  const defaultRef = useRef();

  // Trae todas las plantillas
  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/api/admin/templates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch(e) {
      console.error(e);
      setSnackbar({ open:true, message:"Error cargando plantillas", severity:"error" });
    }
  };

  useEffect(() => {
    if (!loading && user) fetchTemplates();
  }, [loading, user]);

  // Abre diálogo para nueva plantilla
  const handleOpenNew = () => {
    setEditing(null);
    setOpenDialog(true);
    setTimeout(() => {
      nameRef.current.value    = "";
      typeRef.current.value    = "automatic";
      subjectRef.current.value = "";
      contentRef.current.value = "";
      defaultRef.current.checked = false;
    }, 0);
  };

  // Abre diálogo para editar
  const handleOpenEdit = tpl => {
    setEditing(tpl);
    setOpenDialog(true);
    setTimeout(() => {
      nameRef.current.value    = tpl.name;
      typeRef.current.value    = tpl.type;
      subjectRef.current.value = tpl.subject;    // 🆕
      contentRef.current.value = tpl.body;       // ahora body
      defaultRef.current.checked = tpl.is_default;
    }, 0);
  };

  // Inserta placeholder en el textarea
  const insertPlaceholder = code => {
    const ta = contentRef.current;
    const pos = ta.selectionStart;
    const before = ta.value.slice(0,pos);
    const after  = ta.value.slice(pos);
    ta.value = before + code + after;
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + code.length;
  };

  // Guarda (POST o PUT)
  const handleSave = async () => {
    const payload = {
      name:      nameRef.current.value.trim(),
      type:      typeRef.current.value,
      subject:   subjectRef.current.value.trim(),  // 🆕
      body:      contentRef.current.value,         // antes `content`
      is_default: defaultRef.current.checked
    };
    const url    = editing
      ? `${API}/api/admin/templates/${editing.id}`
      : `${API}/api/admin/templates`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type":"application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open:true, message:"Guardado con éxito", severity:"success" });
      setOpenDialog(false);
      fetchTemplates();
    } catch {
      setSnackbar({ open:true, message:"Error al guardar", severity:"error" });
    }
  };

  // Borra plantilla
  const handleDelete = async tpl => {
    if (!confirm(`Eliminar plantilla “${tpl.name}”?`)) return;
    try {
      const res = await fetch(`${API}/api/admin/templates/${tpl.id}`, {
        method:"DELETE",
        headers:{ Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open:true, message:"Eliminado", severity:"success" });
      fetchTemplates();
    } catch {
      setSnackbar({ open:true, message:"Error al eliminar", severity:"error" });
    }
  };

  // Marca plantilla como predeterminada
  const handleSetDefault = async tpl => {
    try {
      const res = await fetch(`${API}/api/admin/templates/${tpl.id}/set-default`, {
        method: "POST",
        headers:{ Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open:true, message:"Predeterminada actualizada", severity:"success" });
      fetchTemplates();
    } catch {
      setSnackbar({ open:true, message:"Error al actualizar predeterminada", severity:"error" });
    }
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt:4 }}>
        <Typography variant="h4" gutterBottom>Plantillas de Propuesta</Typography>
        <Button variant="contained" onClick={handleOpenNew} sx={{ mb:2 }}>
          Nueva Plantilla
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Predet.</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map(tpl=>(
                <TableRow key={tpl.id}>
                  <TableCell>{tpl.name}</TableCell>
                  <TableCell>{tpl.type==="automatic"?"Automática":"Manual"}</TableCell>
                  <TableCell>
                    {tpl.is_default
                      ? "⭐"
                      : <Button size="small" onClick={()=>handleSetDefault(tpl)}>
                          Marcar
                        </Button>
                    }
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={()=>handleOpenEdit(tpl)}>Editar</Button>
                    <Button size="small" color="error" onClick={()=>handleDelete(tpl)}>Borrar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length===0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No hay plantillas</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Diálogo de creación/edición */}
      <Dialog open={openDialog} onClose={()=>setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing?"Editar":"Nueva"} Plantilla</DialogTitle>
        <DialogContent>
          <Box sx={{ display:"flex", flexDirection:"column", gap:2, mt:1 }}>
            <TextField label="Nombre" inputRef={nameRef} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="type-label">Tipo</InputLabel>
              <Select labelId="type-label" label="Tipo" defaultValue="automatic" inputRef={typeRef}>
                <MenuItem value="automatic">Automática</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Asunto (subject)"
              inputRef={subjectRef}
              fullWidth
            />
            <FormControlLabel
              control={<Checkbox inputRef={defaultRef} />}
              label="Predeterminada"
            />
            <Box>
              <Typography variant="subtitle2">Insertar variable:</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap:"wrap" }}>
                {PLACEHOLDERS.map(ph=>(
                  <Chip
                    key={ph.code}
                    label={ph.label}
                    variant="outlined"
                    onClick={()=>insertPlaceholder(ph.code)}
                  />
                ))}
              </Stack>
            </Box>
            <TextField
              label="Cuerpo (body)"
              inputRef={contentRef}
              multiline rows={8}
              fullWidth
              placeholder="Hola {{applicant_name}},..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing?"Guardar":"Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={()=>setSnackbar(s=>({...s,open:false}))}
        anchorOrigin={{ vertical:"bottom", horizontal:"center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
