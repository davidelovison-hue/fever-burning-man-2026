import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTrs } from '../../trs/TrsProvider';
import { getFzMenu, type FzMenuItem } from '../menuData';

function isMenuActive(route: string, pathname: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function MenuItem({ item }: { item: FzMenuItem }) {
  const location = useLocation();
  const [open, setOpen] = useState(item.isOpen ?? false);
  const hasChildren = Boolean(item.items?.length);
  const childActive = item.items?.some((c) => c.route && isMenuActive(c.route, location.pathname));

  if (item.route) {
    const active = isMenuActive(item.route, location.pathname);
    return (
      <NavLink to={item.route} className={`menu-item ${active ? 'menu-item--is-active' : ''}`}>
        <span className="menu-item__label">{item.label}</span>
        {item.badge && <span className="menu-item__badge">{item.badge}</span>}
      </NavLink>
    );
  }

  if (!hasChildren) {
    return (
      <span className="menu-item menu-item--disabled">
        <span className="menu-item__label">{item.label}</span>
        {item.badge && <span className="menu-item__badge">{item.badge}</span>}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`menu-item ${open ? 'menu-item--is-open' : ''} ${childActive ? 'menu-item--has-active-child' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="menu-item__label">{item.label}</span>
        {item.badge && <span className="menu-item__badge">{item.badge}</span>}
        <span className="menu-item__accordion" aria-hidden>▾</span>
      </button>
      <div className={`sidebar__section ${open ? 'sidebar__section--is-open' : ''}`}>
        <ul className="sidebar-menu-section">
          {item.items!.map((child) => (
            <li key={child.label}>
              {child.route ? (
                <NavLink
                  to={child.route}
                  className={() => {
                    const active = isMenuActive(child.route!, location.pathname);
                    return `menu-item menu-item--child ${active ? 'menu-item--is-active' : ''}`;
                  }}
                >
                  <span className="menu-item__label">{child.label}</span>
                </NavLink>
              ) : (
                <span className="menu-item menu-item--child menu-item--disabled">{child.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function FzSidebar({ isOpen }: { isOpen: boolean }) {
  const { role } = useTrs();
  const menu = getFzMenu(role);

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--is-open' : ''}`}>
      <ul className="sidebar__menu">
        {menu.map((item) => (
          <li key={item.label}>
            <MenuItem item={item} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
