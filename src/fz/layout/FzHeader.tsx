import type { UserRole } from '../../trs/trsTypes';
import { FZ_DISPLAY_USER_NAME, ROLE_CONFIG } from '../../trs/roleConfig';

const ROLE_OPTIONS: UserRole[] = ['admin', 'approver', 'requester'];

export function FzHeader({
  role,
  onRoleChange,
  onResetDemo,
  onToggleSidebar,
}: {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetDemo: () => void;
  onToggleSidebar: () => void;
}) {
  return (
    <header role="banner" className="headerbar">
      <div className="headerbar__brand-col">
        <button type="button" aria-label="Toggle sidebar" className="headerbar__menu-btn" onClick={onToggleSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="headerbar__brand">
          <span className="headerbar__brand-fever">fever</span>
          <span className="headerbar__brand-zone">ZONE</span>
        </div>
        <button type="button" className="headerbar__ai-btn">
          <span className="headerbar__ai-plus" aria-hidden>+</span>
          <span className="headerbar__ai-icon" aria-hidden>✦</span>
          Ask FeverZone AI
        </button>
      </div>

      <div className="headerbar__trail">
        <button type="button" className="headerbar__text-btn">Chat with us</button>
        <button type="button" className="headerbar__icon-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="headerbar__badge">9+</span>
        </button>
        <button type="button" className="headerbar__outline-btn">Create event</button>
        <button type="button" className="headerbar__reset-btn" onClick={onResetDemo}>
          Reset demo
        </button>

        <div className="headerbar__user">
          <div className="headerbar__user-info">
            <span className="headerbar__user-name">{FZ_DISPLAY_USER_NAME}</span>
            <label className="headerbar__role-picker">
              <span className="headerbar__role-picker-label">View as</span>
              <span className="headerbar__role-select-wrap">
                <select
                  className="headerbar__role-select"
                  value={role}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  aria-label="View as role"
                >
                  {ROLE_OPTIONS.map((id) => (
                    <option key={id} value={id}>{ROLE_CONFIG[id].label}</option>
                  ))}
                </select>
                <span className="headerbar__role-chevron" aria-hidden>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </label>
          </div>
          <div className="headerbar__avatar" aria-hidden>
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23c4cdd5'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23fff'/%3E%3Cellipse cx='20' cy='34' rx='12' ry='9' fill='%23fff'/%3E%3C/svg%3E"
              alt=""
              width={32}
              height={32}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
