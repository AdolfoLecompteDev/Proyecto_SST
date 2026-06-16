import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login.jsx'
import RecuperarPassword from '../pages/auth/RecuperarPassword.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import ListaUsuarios from '../pages/usuarios/ListaUsuarios.jsx'
import FormUsuario from '../pages/usuarios/FormUsuario.jsx'
import ListaCapacitaciones from '../pages/capacitaciones/ListaCapacitaciones.jsx'
import DetalleCapacitacion from '../pages/capacitaciones/DetalleCapacitacion.jsx'
import FormCapacitacion from '../pages/capacitaciones/FormCapacitacion.jsx'
import FormEvaluacion from '../pages/evaluaciones/FormEvaluacion.jsx'
import ResultadoEvaluacion from '../pages/evaluaciones/ResultadoEvaluacion.jsx'
import MisCertificados from '../pages/certificados/MisCertificados.jsx'
import ReporteSeguimiento from '../pages/seguimiento/ReporteSeguimiento.jsx'
import HistorialConsultas from '../pages/consultas/HistorialConsultas.jsx'
import ConsultaAntecedentesMiembros from '../pages/consultas/ConsultaAntecedentesMiembros.jsx'
import Notificaciones from '../pages/notificaciones/Notificaciones.jsx'
import PerfilUsuario from '../pages/perfil/PerfilUsuario.jsx'
import Configuracion from '../pages/configuracion/Configuracion.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import { ROLES, ROUTES } from '../utils/constants.js'

const ADMIN_ROLES = [ROLES.SUPER_USUARIO, ROLES.ADMIN]
const ALL_ROLES   = [ROLES.SUPER_USUARIO, ROLES.ADMIN, ROLES.FUNCIONARIO]

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.RECUPERAR_PASSWORD} element={<RecuperarPassword />} />

        {/* Todos los roles autenticados */}
        <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
          <Route path={ROUTES.DASHBOARD}      element={<Dashboard />} />
          <Route path={ROUTES.CAPACITACIONES} element={<ListaCapacitaciones />} />
          <Route path="/capacitaciones/:id"   element={<DetalleCapacitacion />} />
          <Route path={ROUTES.EVALUACIONES}   element={<FormEvaluacion />} />
          <Route path="/evaluaciones/:id/preguntas" element={<FormEvaluacion />} />
          <Route path="/evaluaciones/resultado"     element={<ResultadoEvaluacion />} />
          <Route path={ROUTES.CERTIFICADOS}   element={<MisCertificados />} />
          <Route path={ROUTES.NOTIFICACIONES} element={<Notificaciones />} />
          <Route path={ROUTES.PERFIL}         element={<PerfilUsuario />} />
          <Route path={ROUTES.CONFIGURACION}  element={<Configuracion />} />
        </Route>

        {/* Solo ADMIN y SUPER_USUARIO */}
        <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
          <Route path={ROUTES.USUARIOS}           element={<ListaUsuarios />} />
          <Route path={ROUTES.USUARIOS_NUEVO}     element={<FormUsuario />} />
          <Route path={ROUTES.CAPACITACIONES_NUEVA} element={<FormCapacitacion />} />
          <Route path={ROUTES.SEGUIMIENTO}        element={<ReporteSeguimiento />} />
          <Route path={ROUTES.CONSULTAS}          element={<HistorialConsultas />} />
          <Route path={ROUTES.CONSULTAS_ANTECEDENTES} element={<ConsultaAntecedentesMiembros />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
