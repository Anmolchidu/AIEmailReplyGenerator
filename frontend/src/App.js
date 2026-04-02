import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <DashboardPage />
    </AuthProvider>
  );
}
