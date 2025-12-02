import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCut, FaUser, FaPhone, FaDollarSign } from 'react-icons/fa';
import './Citas.css'; 

const Citas = () => {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- FUNCIÓN PARA OBTENER CITAS (CONEXIÓN REAL) ---
  const fetchCitas = async () => {
    setLoading(true);
    
    Swal.fire({
      title: `CARGANDO AGENDA`,
      text: `Consultando citas para el día ${fechaSeleccionada}`,
      background: '#1a1a1a',
      color: '#d4af37',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      // Usamos el endpoint que trae TODAS las citas
      const response = await fetch('https://barberiacitas.somee.com/api/Citas/todas');
      
      if (response.ok) {
        const data = await response.json();
        
        // FILTRAMOS LOS DATOS: Solo las citas para la fecha seleccionada
        const citasDelDia = data.filter(cita => 
            cita.fechaCita.split('T')[0] === fechaSeleccionada
        );
        
        // Mapeamos los datos al formato de la tabla
        const citasFormateadas = citasDelDia.map((cita, index) => ({
            id: index, 
            hora: cita.horaCita,
            cliente: `${cita.nombreCliente} ${cita.apellidoCliente}`,
            servicio: cita.nombreCorteCabello,
            barbero: cita.nombreBarbero,
            telefono: cita.telefono, 
            precio: cita.precio,     
            estado: cita.estado,
            duracion: cita.duracionMinutos
        }));

        setCitas(citasFormateadas);
        Swal.close();
      } else {
        throw new Error('Error al obtener citas');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: 'No pudimos conectar con la base de datos de citas.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#d4af37'
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaSeleccionada]); 

  // Determinar la clase de estilo para el estado de la cita
  const getStatusClass = (estado) => {
    switch (estado) {
      // ASIGNAMOS LA CLASE VERDE (status-confirmada) A COMPLETADA Y CONFIRMADA
      case 'Completada': 
      case 'Confirmada': 
          return 'status-confirmada'; 
      case 'Cancelada': return 'status-cancelada';
      case 'Pendiente': return 'status-pendiente';
      default: return '';
    }
  };


  return (
    <div className="citas-container">
      {/* HEADER */}
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FaArrowLeft /> REGRESAR
        </button>
        <h1>AGENDA DEL DÍA</h1>
      </div>

      {/* FILTROS Y CONTROLES */}
      <div className="controls-bar">
        <div className="date-picker-group">
            <FaCalendarAlt className="icon-detail" size={24} />
            <input 
                type="date" 
                className="date-input"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                disabled={loading}
            />
        </div>
      </div>

      {/* TABLA DE CITAS */}
      <div className="table-wrapper">
        <table className="citas-table">
          <thead>
            <tr>
              <th><FaClock /> Hora</th>
              <th><FaUser /> Cliente</th>
              <th><FaPhone /> Teléfono</th> 
              <th><FaCut /> Servicio</th>
              <th>Barbero</th>
              <th><FaDollarSign /> Precio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#d4af37' }}>Cargando datos...</td></tr>
            ) : (
                citas.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', color: '#888' }}>No hay citas agendadas para esta fecha.</td></tr>
                ) : (
                    citas.map((cita) => (
                    <tr key={cita.id} className={getStatusClass(cita.estado)}>
                        <td data-label="Hora">{cita.hora}</td>
                        <td data-label="Cliente">{cita.cliente}</td>
                        <td data-label="Teléfono">{cita.telefono}</td> 
                        <td data-label="Servicio">{cita.servicio}</td>
                        <td data-label="Barbero">{cita.barbero}</td>
                        <td data-label="Precio">${cita.precio}</td> 
                        <td data-label="Estado">
                            <span className={`status-badge-cita ${getStatusClass(cita.estado)}`}>
                                {cita.estado}
                            </span>
                        </td>
                    </tr>
                    ))
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Citas;