import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// Admin imports
import Login from './pages/Login';
import Layout from './Layout';
import RequireAuth from './RequireAuth';
import Dashboard from './pages/Dashboard';
import AddProject from './pages/AddProject';
import ManageEvents from './pages/ManageEvents';
const ManageProjects = React.lazy(() => import('./pages/ManageProject'));
const ManageCareers = React.lazy(() => import('./pages/ManageCareers'));
const ManageFilms = React.lazy(() => import('./pages/ManageFilms'));
const App = () => (
  <Router>
    <Routes>
      {/* Public site */}
      <Route path="/" element={<Home />} />

      {/* Admin auth */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin protected routes */}
      <Route
        path="/admin/*"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="add-project" element={<AddProject />} />
        <Route path="manage-projects" element={<ManageProjects />} />
        <Route path="manage-events" element={<ManageEvents />} />
        <Route path="manage-careers" element={<ManageCareers />} />
        <Route path="manage-films" element={<ManageFilms />} />

      </Route>
    </Routes>
  </Router>
);

export default App;
