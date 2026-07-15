import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTrs } from '../TrsProvider';
import { ROLE_CONFIG, routeAllowedForRole, screensForRole } from '../roleConfig';

export function TrsAppLayout() {
  const { role, setRole, resetDemo } = useTrs();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role];
  const screens = screensForRole(role);

  if (!routeAllowedForRole(pathname, role) && pathname !== '/') {
    return <Navigate to={config.homeRoute} replace />;
  }

  const handleRoleChange = (next: typeof role) => {
    setRole(next);
    navigate(ROLE_CONFIG[next].homeRoute);
  };

  return (
    <div className="trs-app">
      <header className="trs-app__header">
        <div className="trs-app__brand">
          <span className="trs-app__brand-title">Ticket Request System</span>
          <span className="trs-app__brand-sub">Burning Man 2027 · Demo prototype</span>
        </div>
        <div className="trs-app__header-actions">
          <button type="button" className="trs-app__reset" onClick={resetDemo}>
            Reset demo
          </button>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span className="trs-app__role-label">View as</span>
            <select
              className="trs-app__role-select"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as typeof role)}
            >
              <option value="admin">Admin</option>
              <option value="approver">Approver</option>
              <option value="requester">Camp Lead (Requester)</option>
            </select>
          </label>
        </div>
      </header>

      <div className="trs-app__body">
        <nav className="trs-app__nav" aria-label="TRS screens">
          {screens.map((screen) => (
            <NavLink
              key={screen.id}
              to={screen.path}
              className={({ isActive }) =>
                `trs-app__nav-item${isActive ? ' trs-app__nav-item--active' : ''}`
              }
            >
              {screen.label}
            </NavLink>
          ))}
        </nav>

        <main className="trs-app__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
