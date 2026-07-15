import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { BUSINESS_TYPE_LABELS, SEED_BUSINESSES } from './businessModel';

/** FZ reservations/businesses */
export function BusinessesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const businesses = useMemo(() => {
    let rows = SEED_BUSINESSES;
    if (typeFilter) rows = rows.filter((b) => b.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.contactName.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [search, typeFilter]);

  return (
    <div className="fz-res-page">
      <PageTitle title="Businesses" section="Reservations" sectionLink="/reservations/list" />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100">
          <div className="fz-toolbar">
            <div className="fz-toolbar__filters" data-testid="business-management-filters">
              <div className="fz-toolbar__search">
                <span className="fz-toolbar__search-icon" aria-hidden>🔍</span>
                <input
                  type="search"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="table-search-search-bar-input"
                />
              </div>
              <label className="fz-field" style={{ margin: 0, minWidth: '11rem' }}>
                <span className="fz-field__label">Department</span>
                <select className="fz-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All departments</option>
                  {Object.entries(BUSINESS_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="fz-toolbar__actions">
              <button type="button" className="fz-btn-outline" disabled>Download</button>
              <Link to="/reservations/businesses/new" className="fz-btn-primary" data-testid="business-management-add-business-button">
                Add business
              </Link>
            </div>
          </div>

          <div className="fz-business-table-scroll" data-testid="business-management-table-data">
            <table className="fz-data-table fz-business-table-real">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Channel</th>
                  <th>Balance</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="fz-res-list__no-results" data-testid="table-screen-content-no-results">
                      No businesses match your search.
                    </td>
                  </tr>
                ) : (
                  businesses.map((b) => (
                    <tr key={b.id} className="fz-business-row" onClick={() => navigate(`/reservations/businesses/${b.id}`)}>
                      <td>
                        <Link to={`/reservations/businesses/${b.id}`} className="fz-business-cell-link" onClick={(e) => e.stopPropagation()}>
                          <strong data-testid="business-management-table-full-name">{b.name}</strong>
                          {b.taxIdentificationNumber && (
                            <div className="item__small-row" data-testid="business-management-table-tax-id">
                              {b.taxIdentificationNumber}
                            </div>
                          )}
                          <div className="item__small-row" data-testid="business-management-table-email">{b.email}</div>
                        </Link>
                      </td>
                      <td data-testid="business-management-table-type">
                        <span className="fz-type-tag">{BUSINESS_TYPE_LABELS[b.type]}</span>
                      </td>
                      <td data-testid="business-management-table-contact">
                        <strong data-testid="business-management-table-contact-name">{b.contactName}</strong>
                        <div className="item__small-row" data-testid="business-management-table-contact-phone">{b.phone}</div>
                      </td>
                      <td data-testid="business-management-table-address">{b.address ?? '—'}</td>
                      <td data-testid="business-management-table-custom-channel">
                        {b.hasCustomChannel ? b.channel : 'Not set'}
                      </td>
                      <td>{b.balanceAllowed ? 'Yes' : 'No'}</td>
                      <td>
                        <label className="fz-toggle" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" defaultChecked={b.isManager} readOnly />
                          <span className="fz-toggle__track" />
                        </label>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
