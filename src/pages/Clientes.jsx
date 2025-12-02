import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaSearch, FaPlus, FaEdit, FaPhone, FaEnvelope, FaUserTie, FaCheckCircle, FaTimesCircle, FaBan } from 'react-icons/fa';
import './Clientes.css';

const Clientes = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState([]);

  // --- 1. OBTENER CLIENTES (GET) ---
  const fetchClientes = async (mostrarAlerta = true) => {
    if (mostrarAlerta) {
        Swal.fire({
            title: 'CARGANDO CLIENTES...',
            text: 'Obteniendo base de datos de la clientela',
            background: '#1a1a1a',
            color: '#d4af37',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    }

    try {
      // Endpoint real de Clientes
      const response = await fetch('https://www.barberiacitas.somee.com/api/Clientes'); 
      
      if (response.ok) {
        const data = await response.json();
        
        // Mapeamos los datos reales. Agregamos el campo simulado 'visitas' para el diseño del badge.
        const clientesFormateados = data.map(e => ({
          idCliente: e.idCliente,
          nombre: e.nombre,
          apellido: e.apellido,
          telefono: e.telefono,
          correo: e.correo,
          estado: e.estado,
          visitas: (e.idCliente * 3) % 30 + 1 
        }));

        setClientes(clientesFormateados);
        if (mostrarAlerta) Swal.close();
      } else {
        throw new Error('Error al obtener clientes');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: 'No pudimos cargar la base de datos de clientes.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#d4af37'
      });
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda)
  );

  // --- 2. CAMBIAR ESTADO (DAR DE BAJA) ---
  const handleCambiarEstado = (cliente) => {
    // Solo podemos dar de baja si está activo
    if (!cliente.estado) return;

    const nuevoEstado = false; 
    const accion = 'DAR DE BAJA';

    Swal.fire({
      icon: 'warning',
      title: `${accion} CLIENTE: ${cliente.nombre.toUpperCase()}?`,
      text: `¡Esta acción es IRREVERSIBLE! No se podrá reactivar la cuenta.`, 
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
          const response = await fetch('https://www.barberiacitas.somee.com/api/Clientes/cambiar-estado', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            // Enviamos el JSON que pide el endpoint
            body: JSON.stringify({ idCliente: cliente.idCliente, estado: nuevoEstado })
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡CLIENTE DADO DE BAJA!',
              text: `El cliente ${cliente.nombre} ya no está activo.`,
              background: '#1a1a1a',
              color: '#fff',
              confirmButtonColor: '#d4af37'
            });
            fetchClientes(false); // Recargar la lista
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
  
  // --- MODAL SIMULADO DE EDICIÓN/CREACIÓN ---
  const handleModal = (cliente = null) => {
    Swal.fire({
      title: cliente ? 'EDITAR CLIENTE' : 'NUEVO CLIENTE',
      background: '#1a1a1a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
      text: 'Funcionalidad de Crear/Editar en construcción.',
      icon: 'info'
    });
  };

  return (
    <div className="clientes-container">
      {/* HEADER */}
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FaArrowLeft /> REGRESAR
        </button>
        <h1>BASE DE CLIENTES</h1>
    
      </div>

      {/* BUSCADOR */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o teléfono..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th><FaUserTie /> Nombre</th>
              <th>Apellido</th>
              <th><FaPhone /> Teléfono</th>
              <th><FaEnvelope /> Correo</th>
              <th>Visitas</th>
              <th style={{ textAlign: 'center' }}>Estado / Acción</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cli) => (
              <tr key={cli.idCliente} className={!cli.estado ? 'inactivo' : ''}>
                <td data-label="Nombre">{cli.nombre}</td>
                <td data-label="Apellido">{cli.apellido}</td>
                <td data-label="Teléfono">{cli.telefono}</td>
                <td data-label="Correo">{cli.correo}</td>
                <td data-label="Visitas">
                  <span className={`visitas-badge ${cli.visitas > 20 ? 'gold' : cli.visitas > 5 ? 'silver' : 'bronze'}`}>
                    {cli.visitas}
                  </span>
                </td>
                <td data-label="Acciones" className="action-cell" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  
                  {/* Botón de Editar (Simulado) */}
                  <button 
                    className="action-btn edit" 
                    onClick={() => handleModal(cli)}
                    disabled={!cli.estado} // Deshabilita si está inactivo
                    title={cli.estado ? 'Editar Perfil' : 'Inactivo'}
                  >
                    <FaEdit />
                  </button>

                  {/* Botón de Estado (Dar de Baja) */}
                  <button 
                    className="action-btn estado" 
                    onClick={() => handleCambiarEstado(cli)}
                    disabled={!cli.estado} // Solo se puede dar de baja si está ACTIVO
                    style={{ 
                      backgroundColor: cli.estado ? '#dc3545' : '#444', 
                      color: cli.estado ? '#fff' : '#888',
                      cursor: cli.estado ? 'pointer' : 'not-allowed'
                    }}
                    title={cli.estado ? 'Dar de Baja' : 'Cliente Inactivo'}
                  >
                    {cli.estado ? <FaBan /> : <FaTimesCircle />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientesFiltrados.length === 0 && <p className="no-results">No se encontraron clientes.</p>}
      </div>
    </div>
  );
};

export default Clientes;