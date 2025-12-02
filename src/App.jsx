import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; 
import Home from './pages/Home'; 
import Productos from './pages/Productos'; 
import Cortes from './pages/Cortes'; 
import Empleados from './pages/Empleados'; 
import Usuarios from './pages/Usuarios';
import Clientes from './pages/Clientes'; 
import Citas from './pages/Citas'; // <--- 1. IMPORTADO
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="content">
          <Routes>
            {/* 1. LOGIN (Ruta Raíz) */}
            <Route path="/" element={<Login />} />
            
            {/* 2. RUTAS PROTEGIDAS */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/productos" 
              element={
                <ProtectedRoute>
                  <Productos />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/cortes" 
              element={
                <ProtectedRoute>
                  <Cortes />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/empleados" 
              element={
                <ProtectedRoute>
                  <Empleados />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute>
                  <Usuarios />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/clientes" 
              element={
                <ProtectedRoute>
                  <Clientes />
                </ProtectedRoute>
              } 
            />
            
            {/* <--- 3. RUTA DE CITAS AGREGADA AQUÍ */}
            <Route 
              path="/citas" 
              element={
                <ProtectedRoute>
                  <Citas />
                </ProtectedRoute>
              } 
            />

            {/* 4. RUTA COMODÍN (Siempre al final) */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;