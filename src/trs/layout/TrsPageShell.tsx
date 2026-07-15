import type { ReactNode } from 'react';
import { FzContextBar } from '../../fz/components/FzContextBar';
import { TRS_MODULE_LABEL } from '../roleConfig';

export function TrsPageShell({
  title,
  description,
  actions,
  flushContent,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Removes the divider line under the page title — use when content continues in one block */
  flushContent?: boolean;
  children: ReactNode;
}) {
  const overviewTitle = title.toLowerCase().endsWith('overview') ? title : `${title} overview`;

  return (
    <div className="fz-res-page">
      <FzContextBar sectionLabel={TRS_MODULE_LABEL} />
      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100">
          <div className={`fz-card-head${flushContent ? ' fz-card-head--flush' : ''}`}>
            <div>
              <h2 className="fz-card-head__title">{overviewTitle}</h2>
              {description && <p className="fz-card-head__desc">{description}</p>}
            </div>
            {actions ? <div className="fz-card-head__actions">{actions}</div> : null}
          </div>
          {children}
        </div>
        <footer className="fz-page-footer">
          <span className="fz-page-footer__logo">fever</span>
        </footer>
      </div>
    </div>
  );
}
