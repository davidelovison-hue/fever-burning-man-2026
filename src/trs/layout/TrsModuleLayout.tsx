import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageTitle, EventFilterBar } from '../../fz/components/PageTitle';
import { FlowStrip } from '../components/FlowStrip';
import { useTrs } from '../TrsProvider';
import { ROLE_CONFIG, routeAllowedForRole } from '../roleConfig';

export function TrsModuleLayout() {
  const { role, getGroupById, activeGroupId } = useTrs();
  const { pathname } = useLocation();
  const group = getGroupById(activeGroupId);
  const config = ROLE_CONFIG[role];

  if (!routeAllowedForRole(pathname, role)) {
    return <Navigate to={config.homeRoute} replace />;
  }

  return (
    <div className="gl-shell">
      <PageTitle title="Ticket requests" />
      <div className="role-banner">
        <span className="role-banner__label">Viewing as {config.label}</span>
        <span className="role-banner__desc">{config.description}</span>
      </div>
      <FlowStrip />
      <EventFilterBar summary={`Placement · Theme camps · ${group?.name ?? '—'} · BM 2026`} />
      <Outlet />
    </div>
  );
}
