import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaSearch, FaPlus, FaUser, FaCheckCircle, FaTimesCircle, FaBan } from 'react-icons/fa';
import './Usuarios.css';

const Usuarios = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  // --- 1. OBTENER USUARIOS (GET) ---
  const fetchUsuarios = async (mostrarAlerta = true) => {
    if (mostrarAlerta) {
      Swal.fire({
        title: 'CARGANDO ACCESOS...',
        text: 'Obteniendo lista de usuarios del sistema',
        background: '#1a1a1a',
        color: '#d4af37',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
    }

    try {
      const response = await fetch('https://www.barberiacitas.somee.com/api/Usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data); 
        if (mostrarAlerta) Swal.close();
      } else {
        throw new Error('Error al obtener usuarios');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: 'No pudimos cargar los usuarios del sistema.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#d4af37'
      });
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(u => 
    u.nomUsuario.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  // --- 2. CAMBIAR ESTADO (DAR DE BAJA) ---
  const handleCambiarEstado = (user) => {
    if (!user.estado) return;

    const nuevoEstado = false;
    const accion = 'DAR DE BAJA';

    Swal.fire({
      icon: 'warning',
      title: `${accion} USUARIO: ${user.nomUsuario.toUpperCase()}?`,
      text: `¡Este cambio es IRREVERSIBLE! Una vez dado de baja, NO podrá restablecer el acceso.`, 
      background: '#1a1a1a',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#d4af37',
      confirmButtonText: `SÍ, ${accion}`,
      cancelButtonText: 'CANCELAR'
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        Swal.fire({ title: 'Actualizando estado...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
        
        try {
          const response = await fetch('https://www.barberiacitas.somee.com/api/Usuarios/cambiar-estado', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomUsuario: user.nomUsuario, estado: nuevoEstado })
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡ACCESO REVOCADO!',
              text: `El usuario ${user.nomUsuario} ha sido dado de baja.`,
              background: '#1a1a1a',
              color: '#fff',
              confirmButtonColor: '#d4af37'
            });
            fetchUsuarios(false); 
          } else {
            throw new Error('Error al cambiar estado');
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No se pudo contactar al servidor para el cambio de estado.',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#d4af37'
          });
        }
      }
    });
  };
  
  // --- 3. CREAR NUEVO USUARIO (POST) ---
  const handleAgregarUsuario = () => {
    Swal.fire({
      title: 'CREAR NUEVO ACCESO',
      background: '#1a1a1a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'CREAR USUARIO',
      cancelButtonText: 'CANCELAR',
      width: '600px',
      padding: '2em',
      html: `
        <style>
          .edit-container { display: grid; gap: 15px; text-align: left; font-family: sans-serif; }
          .full-width { grid-column: 1 / -1; }
          .edit-label { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
          .edit-input { width: 100%; background: #252525; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 6px; font-size: 1rem; outline: none; box-sizing: border-box; }
          .edit-input:focus { border-color: #d4af37; box-shadow: 0 0 8px rgba(212, 175, 55, 0.2); }
        </style>

        <div class="edit-container">
          <!-- Nombre de Usuario -->
          <div class="full-width">
            <label class="edit-label">Nombre de Usuario</label>
            <input id="new-nomUsuario" class="edit-input" placeholder="Ej: BarberManager (Solo letras/números)">
          </div>

          <!-- Contraseña -->
          <div class="full-width">
            <label class="edit-label">Contraseña (8 caracteres)</label>
            <input id="new-contrasenia" type="password" class="edit-input" placeholder="Exactamente 8 caracteres" maxlength="8">
          </div>
          
          <!-- Rol (Dropdown con 4 opciones) -->
          <div class="full-width">
            <label class="edit-label">Rol Asignado</label>
            <select id="new-rol" class="edit-input">
                <option value="Administrador">Administrador</option>
                <option value="Contador">Contador</option>
                <option value="Staff">Staff</option>
                <option value="Vendedor">Vendedor</option>
            </select>
          </div>
        </div>
      `,
      didOpen: () => {
        const popup = Swal.getPopup();
        
        // Validación Nombre de Usuario: Solo Letras y Números
        const nomUsuarioInput = popup.querySelector('#new-nomUsuario');
        nomUsuarioInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
        });

        // Validación Contraseña: Solo 8 caracteres
        const contraseniaInput = popup.querySelector('#new-contrasenia');
        contraseniaInput.addEventListener('input', (e) => {
             e.target.value = e.target.value.substring(0, 8);
        });
      },
      preConfirm: () => {
        const nomUsuario = document.getElementById('new-nomUsuario').value.trim();
        const contrasenia = document.getElementById('new-contrasenia').value.trim();
        const rol = document.getElementById('new-rol').value;

        if (!nomUsuario || !contrasenia || !rol) {
          Swal.showValidationMessage('Todos los campos son obligatorios.');
          return false;
        }
        if (contrasenia.length !== 8) {
            Swal.showValidationMessage('La contraseña debe tener exactamente 8 caracteres.');
            return false;
        }

        // Retornamos el objeto JSON que pide la API
        return {
          nomUsuario: nomUsuario,
          contrasenia: contrasenia,
          rol: rol
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Registrando...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
          
          const response = await fetch('https://www.barberiacitas.somee.com/api/Usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡USUARIO CREADO!',
              text: `Acceso para ${result.value.nomUsuario} registrado.`,
              background: '#1a1a1a',
              color: '#fff',
              confirmButtonColor: '#d4af37'
            });
            fetchUsuarios(false); 
          } else {
            throw new Error('Error al registrar usuario');
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No se pudo registrar el nuevo acceso.',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#d4af37'
          });
        }
      }
    });
  };

  return (
    <div className="usuarios-container">
      {/* HEADER */}
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FaArrowLeft /> REGRESAR
        </button>
        <h1>CONTROL DE ACCESOS</h1>
        <button className="add-btn" onClick={handleAgregarUsuario}>
          <FaPlus /> NUEVO
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar usuario o rol..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* GRID DE USUARIOS */}
      <div className="usuarios-grid">
        {usuariosFiltrados.length === 0 ? (
          <p className="no-results">No se encontraron usuarios.</p>
        ) : (
          usuariosFiltrados.map((user) => (
            <div key={user.idUsuario} className={`usuario-card ${!user.estado ? 'inactivo' : ''}`}>
              
              {/* Badge de estado */}
              <div className={`status-badge ${user.estado ? 'active' : 'inactive'}`}>
                {user.estado ? 
                  <><FaCheckCircle size={10} /> ACTIVO</> : 
                  <><FaTimesCircle size={10} /> BAJA</>
                }
              </div>

              <div className="icon-main">
                <FaUser size={40} />
              </div>

              <div className="usuario-info">
                <h3>{user.nomUsuario}</h3>
                <span className="rol-badge">{user.rol}</span>
                
                <div className="acciones-usuario">
                  <button 
                    className="action-btn-key" 
                    onClick={() => handleCambiarEstado(user)}
                    disabled={!user.estado}
                    style={{ 
                      background: user.estado ? '#dc3545' : '#444', 
                      color: user.estado ? '#fff' : '#888',
                      cursor: user.estado ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {user.estado 
                        ? <><FaBan /> DAR DE BAJA</> 
                        : <><FaTimesCircle /> BAJA PERMANENTE</>
                    }
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Usuarios;