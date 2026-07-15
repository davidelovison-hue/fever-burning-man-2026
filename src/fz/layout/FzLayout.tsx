import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FzHeader } from './FzHeader';
import { FzSidebar } from './FzSidebar';
import { useTrs } from '../../trs/TrsProvider';
import { ROLE_CONFIG } from '../../trs/roleConfig';

/** Generic FeverZone layout — prefer TrsFzLayout for the TRS prototype. */
export function FzLayout() {
  const { role, setRole, resetDemo } = useTrs();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1200);

  const handleRoleChange = (next: typeof role) => {
    setRole(next);
    if (pathname !== '/') navigate(ROLE_CONFIG[next].homeRoute);
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
