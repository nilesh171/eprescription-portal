import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import CreatePrescription from './pages/CreatePrescription';
import PatientDashboard from './pages/PatientDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';

// Private Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return <Navigate to="/login" />;
    
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />; // Or a generic unauthorized page
    }

    return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <PrivateRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </PrivateRoute>
            } />
            <Route path="/doctor/create-prescription" element={
              <PrivateRoute allowedRoles={['doctor']}>
                <CreatePrescription />
              </PrivateRoute>
            } />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </PrivateRoute>
            } />

            {/* Pharmacy Routes */}
            <Route path="/pharmacy/dashboard" element={
              <PrivateRoute allowedRoles={['pharmacy']}>
                <PharmacyDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
