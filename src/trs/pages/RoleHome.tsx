import { Navigate } from 'react-router-dom';
import { useTrs } from '../TrsProvider';
import { ROLE_CONFIG } from '../roleConfig';

export function RoleHome() {
  const { role } = useTrs();
  return <Navigate to={ROLE_CONFIG[role].homeRoute} replace />;
}
