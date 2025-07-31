import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Container, Typography, TextField, Button, Snackbar, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress, Modal, Divider, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DashboardLayout from '../../components/DashboardLayout';
import useAdminAuth from '../../hooks/useAdminAuth';

// --- Funciones de API (Idealmente en un archivo de servicios) ---
const getAdminApi = async (endpoint, token) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error en la solicitud a la API');
  }
  return res.json();
};

const postAdminApi = async (endpoint, formData, token) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al enviar los datos');
    }
    return res.json();
};

// --- Componente Modal para Añadir Lección ---
const AddLessonModal = ({ open, handleClose, courseId, onLessonAdded }) => {
    const [lesson, setLesson] = useState({ title: '', orderIndex: '', video: null });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setLesson(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('adminToken');
        const formData = new FormData();
        formData.append('title', lesson.title);
        formData.append('order_index', lesson.orderIndex);
        formData.append('video', lesson.video);

        try {
            await postAdminApi(`/training/courses/${courseId}/lessons`, formData, token);
            onLessonAdded('Lección añadida con éxito', 'success');
            handleClose();
            setLesson({ title: '', orderIndex: '', video: null });
        } catch (error) {
            onLessonAdded(error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 4 }}>
                <Typography variant="h6" gutterBottom>Añadir Nueva Lección</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField name="title" label="Título de la Lección" value={lesson.title} onChange={handleChange} required fullWidth />
                    <TextField name="orderIndex" label="Número de Orden" type="number" value={lesson.orderIndex} onChange={handleChange} required fullWidth />
                    <Button variant="outlined" component="label">
                        Seleccionar Video
                        <input name="video" type="file" hidden onChange={handleChange} required accept="video/*" />
                    </Button>
                    {lesson.video && <Typography variant="caption">{lesson.video.name}</Typography>}
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? <CircularProgress size={24} /> : 'Añadir Lección'}
                    </Button>
                </Box>
            </Paper>
        </Modal>
    );
};


export default function GestionCursos({ toggleDarkMode, currentMode }) {
  const { user, loading: adminLoading } = useAdminAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [courseDetails, setCourseDetails] = useState({}); // { courseId: { enrollments: [], lessons: [] } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', image: null });

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const coursesData = await getAdminApi('/training/admin/courses', token);
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
    if (courseDetails[courseId]) return;

    try {
      const token = localStorage.getItem('adminToken');
      const [enrollmentsData, lessonsData] = await Promise.all([
        getAdminApi(`/training/admin/courses/${courseId}/enrollments`, token),
        getAdminApi(`/training/admin/courses/${courseId}/lessons`, token)
      ]);
      setCourseDetails(prev => ({ ...prev, [courseId]: { enrollments: enrollmentsData, lessons: lessonsData } }));
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
    if (newCourse.image) formData.append('image', newCourse.image);

    try {
      await postAdminApi('/training/courses', formData, token);
      setSnackbar({ open: true, message: 'Curso creado con éxito', severity: 'success' });
      setNewCourse({ title: '', description: '', image: null });
      fetchCourses();
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenModal = (courseId) => {
    setSelectedCourse(courseId);
    setModalOpen(true);
  };

  const handleLessonAdded = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    // Refrescar los detalles del curso para mostrar la nueva lección
    delete courseDetails[selectedCourse];
    handleAccordionChange(selectedCourse);
  };

  if (adminLoading || loading) {
    return <DashboardLayout><Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container></DashboardLayout>;
  }

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Gestión de Cursos</Typography>

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

        <Typography variant="h6" gutterBottom>Cursos Existentes</Typography>
        {courses.map((course) => (
          <Accordion key={course.id} onChange={() => handleAccordionChange(course.id)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ flexShrink: 0, width: '40%' }}>{course.title}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{course.studentCount} Estudiante(s)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Detalles del Curso</Typography>
                <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal(course.id)}>
                  Añadir Lección
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" gutterBottom><strong>Descripción:</strong> {course.description}</Typography>

              {/* Sección de Lecciones */}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Lecciones</Typography>
              {courseDetails[course.id]?.lessons?.length > 0 ? (
                 <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small">
                        <TableHead><TableRow><TableCell>Orden</TableCell><TableCell>Título</TableCell></TableRow></TableHead>
                        <TableBody>
                            {courseDetails[course.id].lessons.map(lesson => (
                                <TableRow key={lesson.id}><TableCell>{lesson.orderIndex}</TableCell><TableCell>{lesson.title}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </TableContainer>
              ) : <Typography variant="caption">No hay lecciones en este curso.</Typography>}

              {/* Sección de Estudiantes */}
              <Typography variant="subtitle2" sx={{ mt: 3 }}>Estudiantes Inscritos</Typography>
              {courseDetails[course.id]?.enrollments?.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Email</TableCell><TableCell>Progreso</TableCell></TableRow></TableHead>
                    <TableBody>
                      {courseDetails[course.id].enrollments.map((enrollment, index) => (
                        <TableRow key={index}>
                          <TableCell>{enrollment.name}</TableCell>
                          <TableCell>{enrollment.email}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}><LinearProgress variant="determinate" value={enrollment.progress} /></Box>
                              <Box sx={{ minWidth: 35 }}><Typography variant="body2" color="text.secondary">{`${enrollment.progress}%`}</Typography></Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : <Typography variant="caption">No hay estudiantes inscritos.</Typography>}
              
              {!courseDetails[course.id] && <Box sx={{textAlign: 'center', my: 2}}><CircularProgress size={24} /></Box>}
            </AccordionDetails>
          </Accordion>
        ))}

        <AddLessonModal open={modalOpen} handleClose={() => setModalOpen(false)} courseId={selectedCourse} onLessonAdded={handleLessonAdded} />

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({...s, open: false}))}>
          <Alert onClose={() => setSnackbar(s => ({...s, open: false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
