// components/DashboardLayout.js
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme, styled } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Box,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const drawerWidth = 260;
const collapsedWidth = 72;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  width: collapsedWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  position: "fixed",
  height: "100vh",
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    ...(open ? openedMixin(theme) : closedMixin(theme)),
  },
}));

export default function DashboardLayout({ children, toggleDarkMode, currentMode }) {
  const theme = useTheme();

  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("sidebarOpen");
      return storedState ? JSON.parse(storedState) : true;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarOpen", JSON.stringify(open));
    }
  }, [open]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: "Inicio", icon: <DashboardIcon />, href: "/" },
    { text: "Ver Ofertas de Empleo", icon: <WorkIcon />, href: "/job-list" },
    { text: "Actualizar Perfil", icon: <PersonIcon />, href: "/profile" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem button component={Link} href={item.href} key={item.text}>
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {currentMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        {children}
      </Box>
    </Box>
  );
}
