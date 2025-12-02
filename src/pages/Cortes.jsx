import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaSearch, FaPlus, FaCut, FaTimes, FaEdit } from 'react-icons/fa';
import './Cortes.css';

const Cortes = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [cortes, setCortes] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  // --- 1. OBTENER CORTES (GET) ---
  const fetchCortes = async (mostrarAlerta = true) => {
    if (mostrarAlerta) {
      Swal.fire({
        title: 'CARGANDO ESTILOS...',
        text: 'Obteniendo el catálogo...',
        background: '#1a1a1a',
        color: '#d4af37',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
    }

    try {
      const response = await fetch('https://detallesbabrber.somee.com/api/CortesCabello/listar');
      if (response.ok) {
        const data = await response.json();
        setCortes(data);
        if (mostrarAlerta) Swal.close();
      } else {
        throw new Error('Error al obtener cortes');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: 'No pudimos cargar el catálogo.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#d4af37'
      });
    }
  };

  useEffect(() => {
    fetchCortes();
  }, []);

  const cortesFiltrados = cortes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // --- 2. EDITAR PRECIO (PUT) ---
  const handleEditar = (corte) => {
    Swal.fire({
      title: 'AJUSTAR PRECIO',
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
          .edit-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; font-family: sans-serif; }
          .full-width { grid-column: 1 / -1; }
          .edit-label { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
          .edit-input { width: 100%; background: #252525; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 6px; font-size: 1rem; outline: none; box-sizing: border-box; }
          .readonly-input { background: #151515; color: #555; border-color: #222; cursor: not-allowed; }
          .price-input { border: 1px solid #d4af37; background: #1e1e1e; font-weight: bold; color: #d4af37; font-size: 1.2rem; }
          .price-input:focus { box-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
        </style>

        <div class="edit-container">
          <div class="full-width">
            <label class="edit-label">Estilo de Corte</label>
            <input class="edit-input readonly-input" value="${corte.nombre}" readonly>
          </div>
          <div class="full-width">
            <label class="edit-label">Descripción</label>
            <textarea class="edit-input readonly-input" rows="2" readonly>${corte.descripcion || ''}</textarea>
          </div>
          <div class="full-width">
            <label class="edit-label" style="color: #fff;">Nuevo Precio ($)</label>
            <!-- CAMBIO IMPORTANTE: type="text" para control total -->
            <input id="edit-precio" type="text" class="edit-input price-input" value="${corte.precio}">
          </div>
          <div class="full-width">
             <p style="color: #666; font-size: 0.75rem; text-align: center; margin-top: 10px;">* Solo se permite modificar el precio.</p>
          </div>
        </div>
      `,
      didOpen: () => {
        // VALIDACIÓN ESTRICTA PRECIO EN EDITAR
        const inputPrecio = Swal.getPopup().querySelector('#edit-precio');
        inputPrecio.addEventListener('input', (e) => {
           let val = e.target.value;
           
           // 1. Eliminar todo lo que NO sea número o punto
           val = val.replace(/[^0-9.]/g, '');
           
           // 2. Si hay más de un punto, cortamos hasta el primero
           if ((val.match(/\./g) || []).length > 1) {
               val = val.substring(0, val.lastIndexOf('.'));
           }
           
           e.target.value = val;
        });
      },
      preConfirm: () => {
        const precio = document.getElementById('edit-precio').value;
        if(!precio || parseFloat(precio) < 0) { Swal.showValidationMessage('Precio inválido'); return false; }
        return { idCorte: corte.idCorte, precio: parseFloat(precio) }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Actualizando...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
          
          const response = await fetch('https://detallesbabrber.somee.com/api/CortesCabello/actualizar-precio', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          });

          if (response.ok) {
            Swal.fire({ icon: 'success', title: '¡PRECIO ACTUALIZADO!', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d4af37' });
            fetchCortes(false); 
          } else { throw new Error('Error al actualizar precio'); }
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'ERROR', text: 'No se pudo actualizar.', background: '#1a1a1a', color: '#fff' });
        }
      }
    });
  };

  // --- 3. AGREGAR NUEVO CORTE (POST MULTIPART) ---
  const handleAgregar = () => {
    Swal.fire({
      title: 'NUEVO ESTILO',
      background: '#1a1a1a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'CREAR CORTE',
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
          .file-input { padding: 10px; cursor: pointer; }
        </style>

        <div class="edit-container">
          <!-- Nombre -->
          <div class="full-width">
            <label class="edit-label">Nombre del Estilo</label>
            <input id="new-nombre" class="edit-input" placeholder="Solo letras...">
          </div>

          <!-- Descripción -->
          <div class="full-width">
            <label class="edit-label">Descripción</label>
            <textarea id="new-desc" class="edit-input" rows="2" placeholder="Solo letras..."></textarea>
          </div>

          <!-- Precio -->
          <div>
            <label class="edit-label" style="color: #fff;">Precio ($)</label>
            <input id="new-precio" type="text" class="edit-input" placeholder="0.00">
          </div>

          <!-- Duración -->
          <div>
            <label class="edit-label" style="color: #fff;">Duración (Minutos)</label>
            <input id="new-duracion" type="text" class="edit-input" placeholder="Ej: 30">
          </div>

          <!-- Imagen (Archivo) -->
          <div class="full-width">
            <label class="edit-label" style="color: #d4af37;">Seleccionar Foto</label>
            <input id="new-img" type="file" class="edit-input file-input" accept="image/*">
          </div>
        </div>
      `,
      didOpen: () => {
        const popup = Swal.getPopup();
        
        // Validación Nombre y Descripción
        const textInputs = [popup.querySelector('#new-nombre'), popup.querySelector('#new-desc')];
        textInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            });
        });

        // Validación Duración
        const duracionInput = popup.querySelector('#new-duracion');
        duracionInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // Validación Precio
        const precioInput = popup.querySelector('#new-precio');
        precioInput.addEventListener('input', (e) => {
            let val = e.target.value;
            val = val.replace(/[^0-9.]/g, '');
            if ((val.match(/\./g) || []).length > 1) {
               val = val.substring(0, val.lastIndexOf('.'));
            }
            e.target.value = val;
        });
      },
      preConfirm: () => {
        const nombre = document.getElementById('new-nombre').value;
        const desc = document.getElementById('new-desc').value;
        const precio = document.getElementById('new-precio').value;
        const duracion = document.getElementById('new-duracion').value;
        const fileInput = document.getElementById('new-img');

        if (!nombre.trim() || !precio || !duracion) {
          Swal.showValidationMessage('Nombre, Precio y Duración son obligatorios');
          return false;
        }
        if (fileInput.files.length === 0) {
          Swal.showValidationMessage('Debes seleccionar una imagen');
          return false;
        }

        const formData = new FormData();
        formData.append('Nombre', nombre);
        formData.append('Descripcion', desc);
        formData.append('Precio', precio);
        formData.append('DuracionMinutos', duracion);
        formData.append('Imagen', fileInput.files[0]);
        formData.append('IdUsuario', 1);
        formData.append('Activo', true);

        return formData;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Subiendo...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
          
          const response = await fetch('https://detallesbabrber.somee.com/api/CortesCabello/crear', {
            method: 'POST',
            body: result.value 
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡CORTE CREADO!',
              text: 'Se ha agregado al catálogo exitosamente.',
              background: '#1a1a1a',
              color: '#fff',
              confirmButtonColor: '#d4af37'
            });
            fetchCortes(false); 
          } else {
            throw new Error('Error al crear');
          }
        } catch (error) {
          console.error(error);
          Swal.fire({ icon: 'error', title: 'ERROR', text: 'No se pudo crear el corte.', background: '#1a1a1a', color: '#fff' });
        }
      }
    });
  };

  return (
    <div className="cortes-container">
      
      {/* ZOOM MODAL */}
      {imagenSeleccionada && (
        <div className="image-modal" onClick={() => setImagenSeleccionada(null)}>
          <button className="close-modal-btn"><FaTimes /></button>
          <img src={imagenSeleccionada} alt="Vista Ampliada" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* HEADER */}
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FaArrowLeft /> REGRESAR
        </button>
        <h1>CATÁLOGO DE ESTILOS</h1>
        <button className="add-btn" onClick={handleAgregar}>
          <FaPlus /> NUEVO
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar estilo (ej: Casquete)..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* GALERÍA */}
      <div className="cortes-grid">
        {cortesFiltrados.length === 0 ? (
           <p className="no-results">No se encontraron cortes.</p>
        ) : (
           cortesFiltrados.map((corte) => (
            <div key={corte.idCorte} className="corte-card">
              
              {/* Imagen con Zoom */}
              <div 
                className="corte-img-wrapper" 
                onClick={() => setImagenSeleccionada(corte.imagenURL || "https://via.placeholder.com/300?text=Sin+Foto")}
              >
                 <img 
                    src={corte.imagenURL || "https://via.placeholder.com/300?text=Sin+Foto"} 
                    alt={corte.nombre} 
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Error+Carga"; }}
                 />
                 <div className="overlay">
                   <span className="ver-mas">VER FOTO</span>
                 </div>
              </div>
              
              {/* Info y Botón Editar */}
              <div className="corte-info">
                <h3>{corte.nombre}</h3>
                <p className="descripcion-corte">{corte.descripcion}</p>
                <div className="info-footer">
                  <span className="duracion">{corte.duracionMinutos} min</span>
                  <span className="precio">${corte.precio}</span>
                </div>
                
                <button 
                  className="select-btn" 
                  onClick={() => handleEditar(corte)}
                  title="Editar Precio"
                >
                  <FaEdit style={{ marginRight: '8px' }} /> EDITAR PRECIO
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cortes;