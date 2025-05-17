// pages/admin/propuestas.js
import React, { useState, useEffect } from "react";
import {
  Container, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Button, TextField, Snackbar, Alert, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from "@mui/material";
import DashboardLayout from "../../components/DashboardLayout";
import useAdminAuth from "../../hooks/useAdminAuth";

export default function PropuestasPage({ toggleDarkMode, currentMode }) {
  /* ───── estados ───── */
  const { user, loading: loadingAuth } = useAdminAuth();
  const [proposals, setProposals] = useState([]);
  const [search, setSearch]       = useState("");
  const [detail, setDetail]       = useState(null);
  const [snack , setSnack]        = useState({open:false,msg:"",sev:"success"});
  const [fetching, setFetching]   = useState(false);
  const [refresh , setRefresh]    = useState(false);

  /* ───── config API ───── */
  const API = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";
  const token = typeof window !== "undefined" && localStorage.getItem("adminToken");
  const headers = { "Content-Type":"application/json", ...(token && {Authorization:`Bearer ${token}`}) };

  /* ───── helper fecha AR ───── */
  const fmtAR = iso => iso
    ? new Intl.DateTimeFormat("es-AR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Argentina/Buenos_Aires"}).format(new Date(iso))
    : "—";

  /* ───── fetch inicial / refresh ───── */
  useEffect(() => {
    if (!user || !token) return;
    setFetching(true);
    fetch(`${API}/api/proposals/`,{headers})
      .then(r=>r.ok?r.json():Promise.reject(r.statusText))
      .then(d=>setProposals(Array.isArray(d.proposals)?d.proposals:[]))
      .catch(e=>setSnack({open:true,msg:`Error: ${e}`,sev:"error"}))
      .finally(()=>setFetching(false));
  },[user,token,refresh]);

  /* ───── envío manual ───── */
  const sendManual = async id => {
    try{
      const r = await fetch(`${API}/api/proposals/${id}/send`,{method:"PATCH",headers});
      if(!r.ok) throw new Error((await r.json()).detail||r.status);
      setSnack({open:true,msg:"Propuesta enviada",sev:"success"});
      setRefresh(r=>!r);
    }catch(e){
      setSnack({open:true,msg:`Error: ${e.message}`,sev:"error"});
    }
  };

  /* ───── filtro seguro ───── */
  const safe = s => (s ?? "").toString().toLowerCase();
  const filtered = proposals.filter(p =>
    safe(p.job_title).includes(safe(search)) ||
    safe(p.applicant_name).includes(safe(search))
  );

  /* ───── UI carga ───── */
  if (loadingAuth || fetching) {
    return (
      <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
        <Box sx={{display:"flex",justifyContent:"center",mt:8}}><CircularProgress/></Box>
      </DashboardLayout>
    );
  }
  if (!user) return null;

  /* ───── componente ───── */
  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{mt:4}}>
        <Typography variant="h4" gutterBottom>Propuestas</Typography>

        <TextField
          fullWidth label="Buscar oferta o postulante"
          value={search} onChange={e=>setSearch(e.target.value)}
          sx={{mb:2}}
        />

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["ID","Oferta","Postulante","Etiqueta","Estado","Creado","Acciones"]
                 .map(h=> <TableCell key={h}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length
               ? filtered.map(p=>(
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.job_title ?? "—"}</TableCell>
                    <TableCell>{p.applicant_name ?? "—"}</TableCell>
                    <TableCell>{p.label==="manual"?"Manual":"Automático"}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{fmtAR(p.created_at)}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={()=>setDetail(p)} sx={{mr:1}}>Ver</Button>
                      {p.label==="manual" && p.status==="pending" &&
                        <Button size="small" variant="contained" onClick={()=>sendManual(p.id)}>
                          Enviar
                        </Button>}
                    </TableCell>
                  </TableRow>
               ))
               : <TableRow><TableCell colSpan={7} align="center">Sin propuestas</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* ───── detalle ───── */}
      <Dialog open={Boolean(detail)} onClose={()=>setDetail(null)} fullWidth maxWidth="md">
        <DialogTitle>Detalle de la Propuesta</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <>
              <Typography><b>ID:</b> {detail.id}</Typography>
              <Typography><b>Oferta:</b> {detail.job_title ?? "—"}</Typography>
              <Typography><b>Postulante:</b> {(detail.applicant_name ?? "—")+" ("+(detail.applicant_email??"—")+")"}</Typography>
              <Typography><b>Etiqueta:</b> {detail.label==="manual"?"Manual":"Automático"}</Typography>
              <Typography><b>Estado:</b> {detail.status}</Typography>
              <Typography><b>Creado:</b> {fmtAR(detail.created_at)}</Typography>
              {detail.sent_at      && <Typography><b>Enviado:</b>   {fmtAR(detail.sent_at)}</Typography>}
              {detail.cancelled_at && <Typography><b>Cancelado:</b> {fmtAR(detail.cancelled_at)}</Typography>}
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={()=>setDetail(null)}>Cerrar</Button></DialogActions>
      </Dialog>

      {/* ───── snackbar ───── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={()=>setSnack(s=>({...s,open:false}))}
        anchorOrigin={{vertical:"bottom",horizontal:"center"}}
      >
        <Alert severity={snack.sev} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export async function getServerSideProps(){ return {props:{}} }
