import { Link, useLocation } from 'react-router-dom';
import { useTrs } from '../TrsProvider';
import { FLOW_STEPS, flowStepActive, flowStepDone, getTabsForRole } from '../roleConfig';
import type { UserRole } from '../trsTypes';

const ROLE_LABEL: Record<UserRole | 'recipient', string> = {
  admin: 'Dept admin',
  approver: 'Approver',
  requester: 'Group lead',
  recipient: 'Recipient',
};

export function FlowStrip() {
  const { role, state } = useTrs();
  const { pathname } = useLocation();
  const allowedRoutes = new Set(getTabsForRole(role).map((t) => t.route));

  return (
    <div className="flow-strip">
      <p className="flow-strip__title">
        Full flow — your steps are highlighted. Switch &quot;View as&quot; to see other roles.
      </p>
      <div className="flow-strip__steps">
        {FLOW_STEPS.map((step, i) => {
          const isYours = step.role === role;
          const isActive = flowStepActive(step, pathname);
          const isDone = flowStepDone(step.id, state);
          const canLink = isYours && step.tabRoute && allowedRoutes.has(step.tabRoute);
          const inner = (
            <>
              <span className="flow-strip__step-label">{step.label}</span>
              <span className="flow-strip__step-role">{ROLE_LABEL[step.role]}</span>
            </>
          );
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
              {canLink ? (
                <Link
                  to={step.tabRoute!}
                  className={[
                    'flow-strip__step',
                    'flow-strip__step--yours',
                    isActive ? 'flow-strip__step--active' : '',
                    isDone ? 'flow-strip__step--done' : '',
                  ].filter(Boolean).join(' ')}
                  title={step.hint}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  className={[
                    'flow-strip__step',
                    isYours ? 'flow-strip__step--yours' : 'flow-strip__step--other',
                    isDone ? 'flow-strip__step--done' : '',
                  ].filter(Boolean).join(' ')}
                  title={isYours ? step.hint : `${ROLE_LABEL[step.role]} — switch role to access`}
                >
                  {inner}
                </div>
              )}
              {i < FLOW_STEPS.length - 1 && <span className="flow-strip__arrow">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
