import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FzHeader } from '../../fz/layout/FzHeader';
import { FzSidebar } from '../../fz/layout/FzSidebar';
import { useTrs } from '../TrsProvider';
import { ROLE_CONFIG, routeAllowedForRole } from '../roleConfig';

export function TrsFzLayout() {
  const { role, setRole, resetDemo } = useTrs();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role];
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1200);

  if (!routeAllowedForRole(pathname, role) && pathname !== '/') {
    return <Navigate to={config.homeRoute} replace />;
  }

  const handleRoleChange = (next: typeof role) => {
    setRole(next);
    navigate(ROLE_CONFIG[next].homeRoute);
  };

  return (
    <div className="fz-host">
      <FzHeader
        role={role}
        onRoleChange={handleRoleChange}
        onResetDemo={resetDemo}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <div className="bl-main bl-main--logged">
        <FzSidebar isOpen={sidebarOpen} />
        <button
          type="button"
          className={`bl-sidebar-backdrop ${sidebarOpen ? 'bl-sidebar-backdrop--visible' : ''}`}
          aria-hidden={!sidebarOpen}
          tabIndex={-1}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="visually-hidden">Close navigation</span>
        </button>
        <div className={`bl-main__content ${sidebarOpen ? 'bl-main__content--sidebar-open' : ''}`}>
          <div className="bl-main__page">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
