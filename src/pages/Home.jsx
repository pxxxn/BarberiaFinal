import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { 
  FaSignOutAlt, 
  FaCalendarCheck, 
  FaBoxOpen,       
  FaCut,           
  FaIdBadge,       
  FaUserTie,       
  FaUserCircle,
  FaUsersCog 
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  
  const usuario = localStorage.getItem('usuarioLogueado') || "CABALLERO"; 
  const [saludo, setSaludo] = useState('');

  useEffect(() => {
    const obtenerSaludo = () => {
      const hora = new Date().getHours();
      if (hora >= 5 && hora < 12) return "BUENOS DÍAS";
      else if (hora >= 12 && hora < 20) return "BUENAS TARDES";
      else return "BUENAS NOCHES";
    };
    setSaludo(obtenerSaludo());
  }, []);

  // Función de Salir con Alerta
  const handleLogout = () => {
    Swal.fire({
      title: '¿CERRAR SESIÓN?',
      text: "¿Estás seguro que quieres abandonar el sistema?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'SÍ, SALIR',
      cancelButtonText: 'CANCELAR',
      background: '#1a1a1a',
      color: '#fff',
      iconColor: '#d4af37',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuarioLogueado');
        navigate('/');
      }
    });
  };

  return (
    <div className="home-container">
      {/* HEADER SUPERIOR */}
      <header className="dashboard-header">
        <div className="brand">
          <h1>BARBERIA<span>WEB</span></h1>
        </div>
        
        <div className="user-info">
          <div className="greeting-container">
            <span className="greeting-time">{saludo}</span>
            <span className="greeting-user">{usuario}</span>
          </div>
          
          <div className="profile-icon-container">
            <FaUserCircle className="header-profile-icon" />
          </div>

          <button onClick={handleLogout} className="logout-btn" title="Cerrar Sesión">
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* GRID DE OPCIONES */}
      <main className="menu-grid">
        
        {/* 1. Ver Citas */}
        <div className="menu-card" onClick={() => navigate('/citas')}>
          <div className="icon-wrapper"><FaCalendarCheck /></div>
          <h3>VER CITAS</h3>
          <p>Agenda y Horarios</p>
        </div>

        {/* 2. Productos (AQUÍ ESTÁ LA REDIRECCIÓN CORRECTA) */}
        <div className="menu-card" onClick={() => navigate('/productos')}>
          <div className="icon-wrapper"><FaBoxOpen /></div>
          <h3>PRODUCTOS</h3>
          <p>Inventario y Venta</p>
        </div>

        {/* 3. Cortes de Cabello */}
        <div className="menu-card" onClick={() => navigate('/cortes')}>
          <div className="icon-wrapper"><FaCut /></div>
          <h3>CORTES</h3>
          <p>Catálogo de Estilos</p>
        </div>

        {/* 4. Empleados */}
        <div className="menu-card" onClick={() => navigate('/empleados')}>
          <div className="icon-wrapper"><FaIdBadge /></div>
          <h3>EMPLEADOS</h3>
          <p>Gestión de Personal</p>
        </div>

        {/* 5. Clientes */}
        <div className="menu-card" onClick={() => navigate('/clientes')}>
          <div className="icon-wrapper"><FaUserTie /></div>
          <h3>CLIENTES</h3>
          <p>Base de Datos</p>
        </div>

        {/* 6. Usuarios */}
        <div className="menu-card" onClick={() => navigate('/usuarios')}>
          <div className="icon-wrapper"><FaUsersCog /></div>
          <h3>USUARIOS</h3>
          <p>Accesos del Sistema</p>
        </div>

      </main>
    </div>
  );
};

export default Home;