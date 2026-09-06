import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { dbUser: user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex-grow w-full">
      <Outlet />
    </div>
  );
}
