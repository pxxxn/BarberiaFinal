import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaSearch, FaPlus, FaEdit } from 'react-icons/fa'; 
import './Productos.css';

const Productos = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]); 

  // --- 1. CONEXIÓN A LA API (GET) ---
  const fetchProductos = async (mostrarAlerta = true) => {
    if (mostrarAlerta) {
      Swal.fire({
        title: 'CARGANDO INVENTARIO...',
        text: 'Obteniendo productos del servidor',
        background: '#1a1a1a',
        color: '#d4af37',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
    }

    try {
      const response = await fetch('https://detallesbabrber.somee.com/api/Productos/obtener');
      
      if (response.ok) {
        const data = await response.json();
        setProductos(data); 
        if (mostrarAlerta) Swal.close(); 
      } else {
        throw new Error('Error al obtener productos');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'ERROR DE CONEXIÓN',
        text: 'No pudimos cargar el inventario.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#d4af37'
      });
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Filtro del buscador
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // --- 2. ACTUALIZAR PRODUCTO (PUT) ---
  const handleEditar = (producto) => {
    Swal.fire({
      title: 'ACTUALIZAR INVENTARIO',
      background: '#1a1a1a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'GUARDAR CAMBIOS',
      cancelButtonText: 'CANCELAR',
      width: '650px',
      padding: '2em',
      html: `
        <style>
          .edit-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; font-family: sans-serif; }
          .full-width { grid-column: 1 / -1; }
          .edit-label { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
          .edit-input { width: 100%; background: #252525; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 6px; font-size: 1rem; outline: none; box-sizing: border-box; }
          .readonly-input { background: #151515; color: #555; border-color: #222; cursor: not-allowed; }
          .editable-input { border: 1px solid #d4af37; background: #1e1e1e; font-weight: bold; color: #d4af37; }
          .editable-input:focus { box-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
        </style>

        <div class="edit-container">
          <div class="full-width">
            <label class="edit-label">Producto (No editable)</label>
            <input class="edit-input readonly-input" value="${producto.nombre}" readonly>
          </div>
          <div>
            <label class="edit-label" style="color: #fff;">Nuevo Precio ($)</label>
            <input id="edit-precio" type="text" class="edit-input editable-input" value="${producto.precio}">
          </div>
          <div>
            <label class="edit-label" style="color: #fff;">Nuevo Stock</label>
            <input id="edit-stock" type="number" class="edit-input editable-input" value="${producto.stock}">
          </div>
          <div class="full-width">
             <p style="color: #555; font-size: 0.8rem; text-align: center; margin-top: 10px;">
               * Solo se permite modificar precio y existencias.
             </p>
          </div>
        </div>
      `,
      didOpen: () => {
        // VALIDACIÓN ESTRICTA PRECIO EN EDITAR
        const inputPrecio = Swal.getPopup().querySelector('#edit-precio');
        inputPrecio.addEventListener('input', (e) => {
           let val = e.target.value;
           val = val.replace(/[^0-9.]/g, ''); 
           if ((val.match(/\./g) || []).length > 1) {
               val = val.substring(0, val.lastIndexOf('.'));
           }
           e.target.value = val;
        });
      },
      preConfirm: () => {
        const precio = document.getElementById('edit-precio').value;
        const stock = document.getElementById('edit-stock').value;
        
        if(!precio || !stock) {
          Swal.showValidationMessage('El precio y stock son obligatorios');
          return false;
        }

        return {
          idProducto: producto.idProducto,
          precio: parseFloat(precio),
          stock: parseInt(stock)
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        try {
          Swal.fire({ title: 'Actualizando...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
          
          const response = await fetch('https://detallesbabrber.somee.com/api/Productos/actualizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          });

          if (response.ok) {
            Swal.fire({ icon: 'success', title: '¡ACTUALIZADO!', text: 'El inventario ha sido modificado.', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d4af37' });
            fetchProductos(false); 
          } else {
            throw new Error('Error al actualizar');
          }
        } catch (error) {
          console.error(error);
          Swal.fire({ icon: 'error', title: 'ERROR', text: 'No se pudo actualizar el producto.', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d4af37' });
        }
      }
    });
  };

  // --- 3. AGREGAR NUEVO PRODUCTO (POST MULTIPART) ---
  const handleAgregar = () => {
    Swal.fire({
      title: 'REGISTRAR PRODUCTO',
      background: '#1a1a1a',
      color: '#d4af37',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'CREAR PRODUCTO',
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
          <!-- Nombre (Solo Letras y Espacios) -->
          <div class="full-width">
            <label class="edit-label">Nombre del Producto</label>
            <input id="new-nombre" class="edit-input" placeholder="Ej. Cera de peinar">
          </div>

          <!-- Descripción (Solo Letras y Espacios) -->
          <div class="full-width">
            <label class="edit-label">Descripción</label>
            <textarea id="new-desc" class="edit-input" rows="2" placeholder="Detalles..."></textarea>
          </div>

          <!-- Precio -->
          <div>
            <label class="edit-label" style="color: #fff;">Precio ($)</label>
            <input id="new-precio" type="text" class="edit-input" placeholder="0.00">
          </div>

          <!-- Stock -->
          <div>
            <label class="edit-label" style="color: #fff;">Stock (Piezas)</label>
            <input id="new-stock" type="text" class="edit-input" placeholder="Ej: 50">
          </div>

          <!-- Imagen (Archivo) -->
          <div class="full-width">
            <label class="edit-label" style="color: #d4af37;">Seleccionar Foto</label>
            <input id="new-img" type="file" class="edit-input file-input" accept="image/*">
            <input type="hidden" id="new-idUsuario" value="1">
          </div>
        </div>
      `,
      didOpen: () => {
        const popup = Swal.getPopup();
        
        // Validación Nombre y Descripción: Solo Letras y Espacios
        const textInputs = [popup.querySelector('#new-nombre'), popup.querySelector('#new-desc')];
        textInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            });
        });

        // Validación Stock: Solo Enteros
        const stockInput = popup.querySelector('#new-stock');
        stockInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // Validación Precio: Un solo punto y números
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
        const stock = document.getElementById('new-stock').value;
        const fileInput = document.getElementById('new-img');

        if (!nombre.trim() || !precio || !stock) {
          Swal.showValidationMessage('Nombre, Precio y Stock son obligatorios');
          return false;
        }
        if (fileInput.files.length === 0) {
          Swal.showValidationMessage('Debes seleccionar una imagen');
          return false;
        }

        // PREPARAR FORMDATA (MULTIPART)
        const formData = new FormData();
        formData.append('Nombre', nombre);
        formData.append('Descripcion', desc);
        formData.append('Precio', precio);
        formData.append('Stock', stock);
        formData.append('Imagen', fileInput.files[0]);
        formData.append('IdUsuario', 1); // Fijo como pediste
        formData.append('Activo', true);

        return formData;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Subiendo...', background: '#1a1a1a', color: '#d4af37', didOpen: () => Swal.showLoading() });
          
          const response = await fetch('https://detallesbabrber.somee.com/api/Productos/crear', {
            method: 'POST',
            body: result.value // Enviamos FormData
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡PRODUCTO CREADO!',
              text: 'Se ha agregado al inventario exitosamente.',
              background: '#1a1a1a',
              color: '#fff',
              confirmButtonColor: '#d4af37'
            });
            fetchProductos(false); 
          } else {
            throw new Error('Error al crear');
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No se pudo crear el producto. Revisa tu conexión/API.',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#d4af37'
          });
        }
      }
    });
  };

  return (
    <div className="productos-container">
      {/* HEADER */}
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FaArrowLeft /> REGRESAR
        </button>
        <h1>INVENTARIO REAL</h1>
        <button className="add-btn" onClick={handleAgregar}>
          <FaPlus /> NUEVO
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="products-grid">
        {productosFiltrados.length === 0 ? (
            <p className="no-results">No se encontraron productos.</p>
        ) : (
            productosFiltrados.map((prod) => (
            <div key={prod.idProducto} className="product-card">
                {/* Stock Badge */}
                <span className={`stock-badge ${prod.stock === 0 ? 'agotado' : prod.stock < 5 ? 'bajo' : 'ok'}`}>
                {prod.stock === 0 ? 'AGOTADO' : `${prod.stock} Pzas`}
                </span>
                
                {/* Imagen */}
                <div className="img-container">
                <img 
                    src={prod.imagenURL || "https://via.placeholder.com/300?text=Sin+Imagen"} 
                    alt={prod.nombre} 
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Error+Imagen"; }} 
                />
                </div>

                {/* Info */}
                <div className="card-info">
                    <h3>{prod.nombre}</h3>
                    <p className="description">{prod.descripcion}</p>
                    <p className="price">${prod.precio} MXN</p>
                    
                    <div className="card-actions">
                        <button className="action-btn edit" onClick={() => handleEditar(prod)}>
                            <FaEdit />
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

export default Productos;