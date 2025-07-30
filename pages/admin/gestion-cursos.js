import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Container, Typography, TextField, Button, Snackbar, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardLayout from '../../components/DashboardLayout';
import useAdminAuth from '../../hooks/useAdminAuth';

// Funciones para llamar a la API (deberían estar en un archivo de servicios)
const getAdminCourses = async (token) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training/admin/courses`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al cargar los cursos');
  return res.json();
};

const getEnrollmentsForCourse = async (courseId, token) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training/admin/courses/${courseId}/enrollments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al cargar las inscripciones');
    return res.json();
  };

const createCourse = async (formData, token) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training/courses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al crear el curso');
    }
    return res.json();
};

export default function GestionCursos({ toggleDarkMode, currentMode }) {
  const { user, loading: adminLoading } = useAdminAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({}); // { courseId: [enrollment] }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [newCourse, setNewCourse] = useState({ title: '', description: '', image: null });

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const coursesData = await getAdminCourses(token);
      setCourses(coursesData);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && !user) {
      router.push('/admin/login');
    } else if (user) {
      fetchCourses();
    }
  }, [adminLoading, user, router, fetchCourses]);

  const handleAccordionChange = async (courseId) => {
    // Si ya tenemos los datos, no los volvemos a pedir
    if (enrollments[courseId]) return;

    try {
        const token = localStorage.getItem('adminToken');
        const enrollmentsData = await getEnrollmentsForCourse(courseId, token);
        setEnrollments(prev => ({ ...prev, [courseId]: enrollmentsData }));
    } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', newCourse.title);
    formData.append('description', newCourse.description);
    if (newCourse.image) {
      formData.append('image', newCourse.image);
    }

    try {
      await createCourse(formData, token);
      setSnackbar({ open: true, message: 'Curso creado con éxito', severity: 'success' });
      setNewCourse({ title: '', description: '', image: null }); // Limpiar formulario
      fetchCourses(); // Refrescar la lista de cursos
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (adminLoading || loading) {
    return <DashboardLayout><Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container></DashboardLayout>;
  }

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Gestión de Cursos</Typography>

        {/* --- Formulario para Crear Curso --- */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Crear Nuevo Curso</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField name="title" label="Título del Curso" value={newCourse.title} onChange={handleFormChange} required fullWidth />
            <TextField name="description" label="Descripción" value={newCourse.description} onChange={handleFormChange} required multiline rows={3} fullWidth />
            <Button variant="contained" component="label">
              Subir Imagen de Portada
              <input name="image" type="file" hidden onChange={handleFormChange} accept="image/*" />
            </Button>
            {newCourse.image && <Typography variant="body2">Archivo seleccionado: {newCourse.image.name}</Typography>}
            <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
              {submitting ? <CircularProgress size={24} /> : 'Crear Curso'}
            </Button>
          </Box>
        </Paper>

        {/* --- Lista de Cursos Existentes --- */}
        <Typography variant="h6" gutterBottom>Cursos Existentes</Typography>
        {courses.map((course) => (
          <Accordion key={course.id} onChange={() => handleAccordionChange(course.id)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ flexShrink: 0, width: '40%' }}>{course.title}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{course.studentCount} Estudiante(s)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" gutterBottom>{course.description}</Typography>
              
              {enrollments[course.id] ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Progreso</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments[course.id].map((enrollment, index) => (
                        <TableRow key={index}>
                          <TableCell>{enrollment.name}</TableCell>
                          <TableCell>{enrollment.email}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress variant="determinate" value={enrollment.progress} />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">{`${enrollment.progress}%`}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : <CircularProgress size={24} />}
              {/* Aquí podrías añadir un formulario para subir lecciones a este curso específico */}
            </AccordionDetails>
          </Accordion>
        ))}

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({...s, open: false}))}>
          <Alert onClose={() => setSnackbar(s => ({...s, open: false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
