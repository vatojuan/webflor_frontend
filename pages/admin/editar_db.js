// pages/admin/editar_db.js
import React, { useState, useEffect, useCallback } from "react"; // Se añade useCallback
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Typography,
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function EditarDB() {
  const { user, loading } = useAdminAuth();
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedFiles, setEditedFiles] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  // --- CORRECCIÓN ESLINT: Se envuelve la función en useCallback ---
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users);
        setFilteredUsers(data.users);
      } else {
        setSnackbar({ open: true, message: "Error al cargar usuarios", severity: "error" });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({ open: true, message: "Error de red al cargar usuarios", severity: "error" });
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [loading, fetchUsers]); // Se añade fetchUsers a las dependencias

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(usersList);
    } else {
      setFilteredUsers(
        usersList.filter(u =>
          (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, usersList]);

  const handleEditClick = (userItem) => {
    setSelectedUser(userItem);
    setEditedName(userItem.name || "");
    setEditedPhone(userItem.phone || "");
    setEditedDescription(userItem.description || "");
    setEditedFiles(userItem.files || []);
    setOpenEditDialog(true);
  };

  const handleDialogClose = () => {
    setSelectedUser(null);
    setOpenEditDialog(false);
    setNewFile(null);
  };

  const handleUpdateUser = async () => {
    // ... (sin cambios en esta función)
  };

  const handleDeleteUser = async (userId) => {
    // ... (sin cambios en esta función, pero se recomienda usar un modal en vez de confirm())
  };

  const handleNewFileChange = (e) => {
    // ... (sin cambios en esta función)
  };

  const handleUploadFile = async () => {
    // ... (sin cambios en esta función)
  };

  const handleDeleteFile = async (fileId) => {
    // ... (sin cambios en esta función, pero se recomienda usar un modal en vez de confirm())
  };

  // --- NUEVA FUNCIÓN PARA DESCARGAR ARCHIVOS DE FORMA SEGURA ---
  const handleDownloadFile = async (file) => {
    if (!selectedUser) {
        setSnackbar({ open: true, message: "No hay un usuario seleccionado.", severity: "error" });
        return;
    }
    try {
        // NOTA: La URL del endpoint debe ser la correcta para el admin.
        // Asumo una ruta como esta. ¡Verifícala en tu backend!
        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/files/${file.id}/signed-url`;
        
        const res = await fetch(endpoint, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            if (data.url) {
                window.open(data.url, "_blank");
            } else {
                throw new Error("La respuesta del servidor no contiene una URL.");
            }
        } else {
            const errorData = await res.json();
            setSnackbar({ open: true, message: errorData.message || "Error al obtener la URL de descarga", severity: "error" });
        }
    } catch (error) {
        console.error("Error al descargar el archivo:", error);
        setSnackbar({ open: true, message: "Error de red al descargar el archivo", severity: "error" });
    }
  };


  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* ... (Tabla de usuarios sin cambios) ... */}
      </Container>

      <Dialog open={openEditDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
            {/* ... (Campos de texto para nombre, teléfono, descripción sin cambios) ... */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Archivos Subidos</Typography>
                {editedFiles && editedFiles.length > 0 ? (
                    editedFiles.map((file) => (
                    <Box
                        key={file.id}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            my: 1,
                            p: 1,
                            borderRadius: 1,
                            "&:hover": { backgroundColor: 'action.hover' }
                        }}
                    >
                        {/* Se quita el <a> que no funcionaba */}
                        <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {file.filename}
                        </Typography>
                        
                        <Box>
                            {/* --- CORRECCIÓN CLAVE: Se llama a la nueva función de descarga --- */}
                            <IconButton onClick={() => handleDownloadFile(file)}>
                                <DownloadIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteFile(file.id)}>
                                <DeleteIcon color="error" />
                            </IconButton>
                        </Box>
                    </Box>
                    ))
                ) : (
                    <Typography variant="body2">No hay archivos subidos.</Typography>
                )}
                {/* ... (Lógica para subir nuevos archivos sin cambios) ... */}
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
