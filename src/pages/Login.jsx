import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './Login.css';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0); 
  const navigate = useNavigate();

  // --- FUNCIÓN PARA CAMBIAR CONTRASEÑA ---
  const handleForgotPassword = async (username) => {
    const { value: nuevaContrasenia } = await Swal.fire({
      title: `Nueva Contraseña para ${username}`,
      text: 'Ingresa la nueva contraseña (debe tener EXACTAMENTE 8 caracteres).',
      input: 'password',
      inputPlaceholder: 'Contraseña (8 dígitos)',
      inputAttributes: {
          maxlength: 8,
          autocapitalize: 'off',
          autocorrect: 'off'
      },
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#d4af37',
      showCancelButton: true,
      inputValidator: (value) => {
          if (value.length !== 8) {
              return 'La contraseña debe tener exactamente 8 caracteres';
          }
      }
    });

    if (nuevaContrasenia) {
        Swal.fire({
            title: 'Cambiando Contraseña...',
            background: '#1a1a1a',
            color: '#d4af37',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const apiUrl = `https://barberiacitas.somee.com/api/Usuarios/cambiar-contrasenia?nomUsuario=${username}&nuevaContrasenia=${nuevaContrasenia}`;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'accept': 'text/plain' }
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡ÉXITO!',
                    text: 'Tu contraseña ha sido actualizada. Intenta iniciar sesión.',
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#d4af37'
                });
                setFailedAttempts(0);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Cambio',
                    text: 'El usuario podría no existir o hubo un error en el sistema.',
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#d4af37'
                });
            }

        } catch (error) {
             Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo contactar al servidor para cambiar la contraseña.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#d4af37'
            });
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- VALIDACIONES PREVIAS (Igual que antes) ---
    if (!usuario.trim() || !password.trim()) {
      Swal.fire({ icon: 'error', title: '¡FALTAN DATOS!', text: 'Debes llenar usuario y contraseña.', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d4af37' });
      return;
    }
    if (usuario.includes('@')) {
      Swal.fire({ icon: 'error', title: 'SOLO USUARIOS', text: 'No aceptamos correos. Usa tu nombre de usuario.', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d4af37' });
      return;
    }
    if (password.length !== 8) {
      Swal.fire({ icon: 'warning', title: 'CONTRASEÑA INCORRECTA', text: 'La contraseña debe tener EXACTAMENTE 8 caracteres.', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d4af37', confirmButtonText: 'CORREGIR' });
      return;
    }

    // --- CONEXIÓN CON LA API DE LOGIN ---
    Swal.fire({ title: 'VERIFICANDO...', text: 'Consultando la base de datos de la barbería', background: '#1a1a1a', color: '#d4af37', showConfirmButton: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const response = await fetch('https://barberialogin.somee.com/api/Usuario/ValidarLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomUsuario: usuario, contrasenia: password })
      });
      
      let loginSuccess = false;
      if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data === true) {
              loginSuccess = true;
          }
      }

      if (loginSuccess) {
        // --- 1. CREDENCIALES CORRECTAS. AHORA VERIFICAR ESTADO ---
        Swal.update({ title: 'VERIFICANDO ESTADO...', text: 'Chequeando permisos de acceso' });

        const statusResponse = await fetch('https://www.barberiacitas.somee.com/api/Usuarios');
        const usersData = await statusResponse.json();

        // Buscamos el usuario en la lista para ver el ESTADO
        const currentUser = usersData.find(u => u.nomUsuario.toLowerCase() === usuario.toLowerCase());
        
        if (currentUser && currentUser.estado === false) {
            // --- BLOQUEO DE SEGURIDAD (DADO DE BAJA) ---
            setFailedAttempts(0); 
            Swal.fire({
                icon: 'error',
                title: 'ACCESO BLOQUEADO',
                text: `El usuario ${usuario} ha sido dado de baja del sistema. Contacte a un administrador.`,
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#dc3545' 
            });
            return; // Detener el flujo aquí
        }

        // --- 2. ÉXITO REAL: ESTADO ACTIVO ---
        localStorage.setItem('usuarioLogueado', usuario);
        setFailedAttempts(0);
        
        Swal.fire({ icon: 'success', title: 'ACCESO CONCEDIDO', text: `Bienvenido, ${usuario}. Éxito!.`, background: '#000', color: '#d4af37', iconColor: '#d4af37', showConfirmButton: false, timer: 2000 }).then(() => {
          navigate('/home'); 
        });

      } else {
        // --- FALLO EN CREDENCIALES ---
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        Swal.fire({
          icon: 'error',
          title: 'ACCESO DENEGADO',
          text: `Credenciales incorrectas. Intento ${newAttempts} de 3.`,
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#d4af37'
        });

        // Verificamos si llegamos al límite
        if (newAttempts >= 3) {
            Swal.fire({
                icon: 'question',
                title: '¿Problemas con la Contraseña?',
                text: 'Has fallado 3 veces. ¿Deseas cambiar tu contraseña?',
                background: '#1a1a1a',
                color: '#fff',
                showCancelButton: true,
                confirmButtonColor: '#d4af37',
                cancelButtonColor: '#dc3545',
                confirmButtonText: 'Sí, cambiar',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.isConfirmed) {
                    handleForgotPassword(usuario);
                } else {
                    setFailedAttempts(0);
                }
            });
        }
      }

    } catch (error) {
      Swal.fire({ icon: 'question', title: 'ERROR DE SISTEMA', text: 'No pudimos conectar con el servidor. Intenta más tarde.', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d4af37' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* LA BARRA TRICOLOR */}
        <div className="barber-pole"></div>

        <div className="login-content">
          <h2>Barberia</h2> 
          <p className="login-subtitle">Acceso Administrativo</p>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="usuario">Nombre de Usuario</label>
              <input 
                type="text" 
                id="usuario" 
                placeholder="Ej: BarberKing"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Exactamente 8 caracteres"
                maxLength={8} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-btn">Entrar</button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;