import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import Users from './pages/Users';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Route publique — sans Navbar ── */}
        <Route path="/login" element={<Login />} />

        {/* ── Routes protégées — avec Navbar ── */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="app-layout">
                <Navbar />
                <main className="app-main">
                  <Routes>
                    <Route index                   element={<Dashboard />}      />
                    <Route path="/"                element={<Dashboard />}      />
                    <Route path="/create-ticket"   element={<CreateTicket />}   />
                    <Route path="/tickets/:id"     element={<TicketDetails />}  />
                    <Route path="/users"           element={<Users />}          />
                    {/* Route inconnue → Dashboard */}
                    <Route path="*"               element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Route>

        {/* Racine absolue → login si pas connecté, géré par ProtectedRoute */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
