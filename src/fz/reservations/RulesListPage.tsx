import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { SEED_RULES } from './rulesModel';

/** FZ reservations/rules/list */
export function RulesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const rules = useMemo(() => {
    if (!search.trim()) return SEED_RULES;
    const q = search.toLowerCase();
    return SEED_RULES.filter((r) => r.displayName.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="fz-res-page">
      <PageTitle title="Reservation rules" section="Reservations" sectionLink="/reservations/list" />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100">
          <div className="fz-toolbar">
            <div className="fz-toolbar__filters">
              <div className="fz-toolbar__search">
                <span className="fz-toolbar__search-icon" aria-hidden>🔍</span>
                <input
                  type="search"
                  placeholder="Search rules"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="fz-toolbar__actions">
              <button
                type="button"
                className="fz-btn-primary"
                data-testid="add-new-rule-button"
                onClick={() => navigate('/reservations/rules/new')}
              >
                Add new rule
              </button>
            </div>
          </div>

          <p className="fz-res-rules-intro">
            Configure capacity limits, timeframes, and unpaid reservation expiration per business type or channel.
          </p>

          <div className="fz-rules-table-scroll" data-testid="rules-list-table-data">
            <table className="fz-data-table fz-rules-table-real">
              <thead>
                <tr>
                  <th>Applying to</th>
                  <th className="num">Affected businesses</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="fz-res-list__no-results" data-testid="rules-list-no-results">
                      No rules found
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr
                      key={rule.id}
                      className="fz-rules-row"
                      onClick={() => navigate(`/reservations/rules/${rule.id}`)}
                    >
                      <td>{rule.displayName}</td>
                      <td className="num">{rule.affectedBusinessesCount}</td>
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
