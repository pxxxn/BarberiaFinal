import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaSearch, FaPlus, FaEdit, FaPhone, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './Empleados.css';

const Empleados = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [empleados, setEmpleados] = useState([]);

  // URL DE LA IMAGEN UNIFICADA (BRAYAN FADE)
  const FOTO_DEFAULT = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop";

  // --- 1. OBTENER EMPLEADOS (GET) ---
  const fetchEmpleados = async (mostrarAlerta = true) => {
    if (mostrarAlerta) {
      Swal.fire({
        title: 'CARGANDO EQUIPO...',
        text: 'Obteniendo lista de empleados',
        background: '#1a1a1a',
        color: '#d4af37',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
    }

    try {
      const response = await fetch('https://barberialogin.somee.com/api/Empleados');
      if (response.ok) {
        const data = await response.json();
        setEmpleados(data);
        if (mostrarAlerta) Swal.close();
      } else {
        throw new Error('Error al obtener empleados');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: 'No pudimos cargar la lista de empleados.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#d4af37'
      });
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const empleadosFiltrados = empleados.filter(e => 
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    e.apellido.toLowerCase().includes(busqueda.toLowerCase())
  );

  // --- FORMATO DE FECHA ---
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Sin fecha";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- 2. EDITAR EMPLEADO (PUT) ---
  const handleEditar = (empleado) => {
    if (!empleado.estado) {
      Swal.fire({
        icon: 'warning',
        title: 'EMPLEADO INACTIVO',
        text: 'No se puede editar a un empleado dado de baja.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#dc3545'
      });
      return; 
    }

    Swal.fire({
      title: `EDITAR PERFIL: ${empleado.nombre}`,
      background: '#1a1a1a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'GUARDAR CAMBIOS',
      cancelButtonText: 'CANCELAR',
      width: '600px',
      padding: '2em',
      html: `
        <style>
          .edit-container { display: grid; gap: 15px; text-align: left; font-family: sans-serif; }
          .input-group { margin-bottom: 15px; }
          .edit-label { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
          .edit-input { width: 100%; background: #252525; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 6px; font-size: 1rem; outline: none; box-sizing: border-box; }
          .edit-input:focus { border-color: #d4af37; }
          .readonly-input { background: #151515; color: #555; border-color: #222; cursor: not-allowed; }
          .checkbox-label { color: #fff; font-weight: bold; display: flex; align-items: center; gap: 10px; cursor: pointer; }
        </style>

        <div class="edit-container">
          <div class="input-group">
            <label class="edit-label">Nombre Completo</label>
            <input class="edit-input readonly-input" value="${empleado.nombre} ${empleado.apellido}" readonly>
          </div>
          
          <div class="input-group">
            <label class="edit-label">Teléfono</label>
            <input id="emp-telefono" type="tel" class="edit-input" value="${empleado.telefono}" placeholder="Solo números" maxLength="10">
          </div>

          <div class="input-group">
            <label class="edit-label">Correo</label>
            <input id="emp-correo" type="email" class="edit-input" value="${empleado.correo}">
          </div>
          
          <div class="input-group" style="margin-top: 20px;">
            <label class="checkbox-label">
              <input type="checkbox" id="emp-estado" style="width: 20px; height: 20px;" ${empleado.estado ? 'checked' : ''}>
              Mantener Activo (Desmarcar para dar de baja)
            </label>
          </div>
        </div>
      `,
      didOpen: () => {
        // Validación de solo 10 números en Teléfono (Editar)
        const telInput = Swal.getPopup().querySelector('#emp-telefono');
        telInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 10);
        });
      },
      preConfirm: () => {
        const telefono = document.getElementById('emp-telefono').value;
        const correo = document.getElementById('emp-correo').value;
        const estado = document.getElementById('emp-estado').checked;

        if (!telefono || !correo) {
          Swal.showValidationMessage('Teléfono y correo son obligatorios');
          return false;
        }
        if (telefono.length !== 10) {
            Swal.showValidationMessage('El teléfono debe tener exactamente 10 dígitos.');
            return false;
        }

        return {
          idEmpleado: empleado.idEmpleado,
          idUsuario: empleado.idUsuario,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          telefono: telefono,
          correo: correo,
          fechaContratacion: empleado.fechaContratacion,
          estado: estado 
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        const estadoOriginal = empleado.estado;
        const nuevoEstado = result.value.estado;
        const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`;

        if (estadoOriginal && !nuevoEstado) {
          const warning = await Swal.fire({
            icon: 'warning',
            title: `¡DAR DE BAJA A ${nombreCompleto.toUpperCase()}!`,
            text: `¿Estás ABSOLUTAMENTE seguro? Una vez dado de baja, NO podrás restablecerlo.`,
            background: '#1a1a1a',
            color: '#fff',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#d4af37',
            confirmButtonText: 'SÍ, DAR DE BAJA',
            cancelButtonText: 'CANCELAR'
          });
          
          if (!warning.isConfirmed) {
            return; 
          }
        }
        
        try {
          Swal.fire({ title: 'Guardando...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
          
          const response = await fetch(`https://barberialogin.somee.com/api/Empleados/${result.value.idEmpleado}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(result.value)
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡PERFIL ACTUALIZADO!',
              text: 'Los datos del empleado han sido modificados.',
              background: '#1a1a1a',
              color: '#fff',
              confirmButtonColor: '#d4af37'
            });
            fetchEmpleados(false); 
          } else {
            throw new Error('Error en la API al actualizar');
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No se pudo completar la actualización.',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#d4af37'
          });
        }
      }
    });
  };

  // --- 3. CREAR NUEVO EMPLEADO (POST) ---
  const handleAgregar = () => {
    Swal.fire({
      title: 'REGISTRAR EMPLEADO',
      background: '#1a1a1a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'REGISTRAR',
      cancelButtonText: 'CANCELAR',
      width: '700px',
      padding: '2em',
      html: `
        <style>
          .edit-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; font-family: sans-serif; }
          .full-width { grid-column: 1 / -1; }
          .edit-label { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
          .edit-input { width: 100%; background: #252525; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 6px; font-size: 1rem; outline: none; box-sizing: border-box; }
          .edit-input:focus { border-color: #d4af37; box-shadow: 0 0 8px rgba(212, 175, 55, 0.2); }
        </style>

        <div class="edit-container">
          <div>
            <label class="edit-label">Nombre</label>
            <input id="new-nombre" class="edit-input" placeholder="Nombre (Solo letras)">
          </div>
          <div>
            <label class="edit-label">Apellido</label>
            <input id="new-apellido" class="edit-input" placeholder="Apellido (Solo letras)">
          </div>
          <div>
            <label class="edit-label">Teléfono</label>
            <input id="new-telefono" class="edit-input" placeholder="10 dígitos" maxLength="10">
          </div>
          <div>
            <label class="edit-label">Correo</label>
            <input id="new-correo" type="email" class="edit-input" placeholder="correo@ejemplo.com">
          </div>
          <input type="hidden" id="new-idUsuario" value="1">
        </div>
      `,
      didOpen: () => {
        const popup = Swal.getPopup();
        
        // Validación 1: Nombre y Apellido (Solo Letras y Espacios)
        const nameInputs = [popup.querySelector('#new-nombre'), popup.querySelector('#new-apellido')];
        nameInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            });
        });

        // Validación 2: Teléfono (Solo Números y Límite de 10)
        const telInput = popup.querySelector('#new-telefono');
        telInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 10);
        });
      },
      preConfirm: () => {
        const nombre = document.getElementById('new-nombre').value.trim();
        const apellido = document.getElementById('new-apellido').value.trim();
        const telefono = document.getElementById('new-telefono').value.trim();
        const correo = document.getElementById('new-correo').value.trim();
        const idUsuario = parseInt(document.getElementById('new-idUsuario').value);

        if (!nombre || !apellido || !telefono || !correo) {
          Swal.showValidationMessage('Todos los campos son obligatorios.');
          return false;
        }

        // Validación 10 dígitos en Teléfono
        if (telefono.length !== 10) {
          Swal.showValidationMessage('El teléfono debe tener exactamente 10 dígitos.');
          return false;
        }

        // Validación de Correo con @
        if (!correo.includes('@') || !correo.includes('.')) {
          Swal.showValidationMessage('El correo debe tener un formato válido (contener @ y .).');
          return false;
        }
        
        // Función para capitalizar (Mayúscula al inicio de cada palabra)
        const capitalizeWords = (str) => {
          return str.toLowerCase().split(' ').map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1);
          }).join(' ');
        };

        // Retornamos el objeto JSON con nombres capitalizados
        return {
          idUsuario: idUsuario,
          nombre: capitalizeWords(nombre),
          apellido: capitalizeWords(apellido),
          telefono: telefono,
          correo: correo,
          fechaContratacion: new Date().toISOString(),
          estado: true 
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Registrando...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
          
          const response = await fetch('https://barberialogin.somee.com/api/Empleados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡REGISTRADO!',
              text: `Empleado ${result.value.nombre} dado de alta.`,
              background: '#1a1a1a',
              color: '#fff',
              confirmButtonColor: '#d4af37'
            });
            fetchEmpleados(false); 
          } else {
            throw new Error('Error en la API al registrar');
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No se pudo completar el registro.',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#d4af37'
          });
        }
      }
    });
  };

  return (
    <div className="empleados-container">
      {/* HEADER */}
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FaArrowLeft /> REGRESAR
        </button>
        <h1>EQUIPO DE TRABAJO</h1>
        <button className="add-btn" onClick={handleAgregar}>
          <FaPlus /> NUEVO
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="search-bar">
        <FaSearch className="icon-detail" />
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="empleados-grid">
        {empleadosFiltrados.length === 0 ? (
           <p className="no-results">No se encontraron empleados.</p>
        ) : (
           empleadosFiltrados.map((emp) => (
            <div key={emp.idEmpleado} className={`empleado-card ${!emp.estado ? 'inactivo' : ''}`}>
              
              {/* ETIQUETA DE ESTADO (ACTIVO/BAJA) */}
              <div className={`status-badge ${emp.estado ? 'active' : 'inactive'}`}>
                {emp.estado ? 
                  <><FaCheckCircle size={10} /> ACTIVO</> : 
                  <><FaTimesCircle size={10} /> BAJA</>
                }
              </div>

              {/* FOTO CIRCULAR */}
              <div className="foto-wrapper">
                <img src={FOTO_DEFAULT} alt={emp.nombre} />
              </div>

              <div className="empleado-info">
                <h3>{emp.nombre} {emp.apellido}</h3>
                
                <div className="detalles">
                  <p><FaPhone className="icon-detail" /> {emp.telefono}</p>
                  <p><FaEnvelope className="icon-detail" /> {emp.correo}</p>
                  <p><FaCalendarAlt className="icon-detail" /> {formatearFecha(emp.fechaContratacion)}</p>
                </div>

                <button 
                  className="action-btn-full" 
                  onClick={() => handleEditar(emp)}
                  style={{ opacity: emp.estado ? 1 : 0.4, cursor: emp.estado ? 'pointer' : 'not-allowed' }}
                >
                  <FaEdit /> EDITAR PERFIL
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Empleados;