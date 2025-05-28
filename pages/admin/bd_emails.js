// pages/admin/bd_emails.js
import { useState } from "react";
import {
  Tabs, Tab, Box, Button, Typography, TextField, Paper, Container,
  List, ListItem, ListItemText, LinearProgress, Snackbar, Alert,
  Card, CardHeader, CardContent, Divider, IconButton
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";
import axios from "axios";

export default function BdEmails() {
  useAdminAuth();
  const [tab, setTab]         = useState(0);
  const [files, setFiles]     = useState([]);
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [form, setForm] = useState({ email: "", name: "", phone: "", notes: "" });
  const [snack, setSnack] = useState({ open:false, msg:"", sev:"success" });

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const api   = process.env.NEXT_PUBLIC_API_URL;

  const handleFileSelect = e => setFiles(Array.from(e.target.files));
  const reset = () => { setFiles([]); setResults([]); };

  const uploadFiles = async () => {
    if (!files.length) return;
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    setUploading(true);
    try{
      const { data } = await axios.post(`${api}/admin_emails_upload`, fd, {
        headers:{ "Authorization":`Bearer ${token}` },
        onUploadProgress: e => setProgress(Math.round(100*e.loaded/e.total))
      });
      setResults(data.results);
      setSnack({open:true,msg:"Procesado",sev:"success"});
    }catch(e){ setSnack({open:true,msg:"Error procesando",sev:"error"}); }
    finally{ setUploading(false); setProgress(0); }
  };

  const addManual = async () => {
    if(!form.email){ setSnack({open:true,msg:"E-mail requerido",sev:"error"}); return; }
    try{
      await axios.post(`${api}/admin_emails_manual`, form, { headers:{ "Authorization":`Bearer ${token}` } });
      setSnack({open:true,msg:"Contacto agregado",sev:"success"});
      setForm({ email:"", name:"", phone:"", notes:"" });
    }catch(e){
      setSnack({open:true,msg:e.response?.data?.detail||"Error",sev:"error"});
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ py:4 }}>
        <Paper sx={{ p:3 }}>
          <Typography variant="h4" align="center" gutterBottom>BD E-mails</Typography>

          <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mb:3 }}>
            <Tab label="Importar archivos" />
            <Tab label="Añadir manual" />
          </Tabs>

          {/* ---------- TAB 0 ---------- */}
          {tab===0 && (
            <>
              <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                Seleccionar archivos
                <input hidden multiple onChange={handleFileSelect} />
              </Button>
              {files.length>0 && (
                <Box mt={2}>
                  <List dense>
                    {files.map(f=>(
                      <ListItem key={f.name}><ListItemText primary={f.name} /></ListItem>
                    ))}
                  </List>
                  <Button onClick={uploadFiles} variant="contained" sx={{ mt:1 }}>Procesar</Button>
                </Box>
              )}
              {uploading && (
                <Box mt={2}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography>{progress}%</Typography>
                </Box>
              )}
              {results.length>0 && (
                <Box mt={4}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Resultados</Typography>
                    <IconButton onClick={()=>setResults([])}><DeleteIcon/></IconButton>
                  </Box>
                  {results.map((r,i)=>(
                    <Card key={i} sx={{ my:2 }}>
                      <CardHeader
                        title={`${r.file} – ${r.email||'sin email'}`}
                        subheader={r.status}
                      />
                      <Divider/>
                      <CardContent>
                        <List dense>{r.logs.map((l,idx)=><ListItem key={idx}><ListItemText primary={l}/></ListItem>)}</List>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}

          {/* ---------- TAB 1 ---------- */}
          {tab===1 && (
            <Box component="form" sx={{ display:"flex", flexDirection:"column", gap:2 }}>
              <TextField label="E-mail *" value={form.email}
                         onChange={e=>setForm({...form,email:e.target.value})}/>
              <TextField label="Nombre" value={form.name}
                         onChange={e=>setForm({...form,name:e.target.value})}/>
              <TextField label="Teléfono" value={form.phone}
                         onChange={e=>setForm({...form,phone:e.target.value})}/>
              <TextField label="Notas" value={form.notes} multiline rows={3}
                         onChange={e=>setForm({...form,notes:e.target.value})}/>
              <Button variant="contained" onClick={addManual}>Guardar</Button>
            </Box>
          )}
        </Paper>

        <Snackbar open={snack.open} autoHideDuration={4000}
                  onClose={()=>setSnack({...snack,open:false})}>
          <Alert severity={snack.sev} variant="filled">{snack.msg}</Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
