import { Link, useParams } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { SEED_RULES } from './rulesModel';

/** FZ reservations/rules/:ruleId */
export function RulesFormPage() {
  const { ruleId } = useParams();
  const isNew = ruleId === 'new';
  const rule = !isNew ? SEED_RULES.find((r) => r.id === ruleId) : undefined;

  if (!isNew && !rule) {
    return (
      <div className="fz-res-page">
        <PageTitle title="Rule not found" section="Rules" sectionLink="/reservations/rules/list" />
        <div className="main-wrapper">
          <p>Rule not found.</p>
          <Link to="/reservations/rules/list" className="fz-btn-secondary fz-res-inline-cta">Back to rules</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fz-res-page">
      <PageTitle
        title={isNew ? 'Create rule' : `Edit · ${rule!.displayName}`}
        section="Rules"
        sectionLink="/reservations/rules/list"
      />

      <div className="main-wrapper">
        <div className="fz-res-alert fz-res-alert--warning" style={{ marginBottom: '1rem' }}>
          Changes affect future reservations only. Existing unpaid reservations keep their current expiration.
        </div>

        <div className="fz-form-card">
          <h2 className="fz-form-section-title">General info</h2>

          <label className="fz-field">
            <span className="fz-field__label">Rule applies to</span>
            <select className="fz-select" defaultValue={rule?.ruleTarget ?? 'businessType'} disabled={!isNew}>
              <option value="businessType">Business type</option>
              <option value="channel">Channel</option>
            </select>
          </label>

          <label className="fz-field">
            <span className="fz-field__label">Business type / channel</span>
            <input className="fz-input" type="text" defaultValue={rule?.displayName ?? 'Educational'} readOnly={!isNew} />
          </label>

          <h2 className="fz-form-section-title">Attributes</h2>

          <div className="fz-selection-tiles">
            <div className="fz-selection-tile fz-selection-tile--selected">
              <p className="fz-selection-tile__title">Business type rule</p>
              <p className="fz-selection-tile__desc">Applies to all businesses of the selected type.</p>
            </div>
            <div className="fz-selection-tile">
              <p className="fz-selection-tile__title">Channel rule</p>
              <p className="fz-selection-tile__desc">Applies to a specific sales channel.</p>
            </div>
          </div>

          <h2 className="fz-form-section-title">Capacity limits</h2>
          <div className="fz-rules-form__row">
            <label className="fz-field">
              <span className="fz-field__label">Min tickets per reservation</span>
              <input className="fz-input" type="number" defaultValue={rule?.minTickets ?? 1} />
            </label>
            <label className="fz-field">
              <span className="fz-field__label">Max tickets per reservation</span>
              <input className="fz-input" type="number" defaultValue={rule?.maxTickets ?? 50} />
            </label>
          </div>

          <h2 className="fz-form-section-title">Unpaid reservation expiration</h2>
          <label className="fz-field">
            <span className="fz-field__label">Expires after (hours)</span>
            <input className="fz-input" type="number" defaultValue={rule?.expiresAfterInHours ?? 168} />
            <p className="fz-form-helper">Unpaid reservations expire after {rule?.expiresAfterInHours ?? 168} hours.</p>
          </label>

          <div className="fz-res-alert fz-res-alert--info" style={{ marginTop: '1rem' }}>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>Reservations open 90 days before event</li>
              <li>Reservations close 24 hours before event</li>
              <li>Ticket sales require 48 hours in advance</li>
            </ul>
          </div>

          <div className="reservations-rules__submit">
            {!isNew && (
              <button type="button" className="fz-btn-secondary" style={{ color: '#eb0052', marginRight: 'auto' }}>
                Delete rule
              </button>
            )}
            <Link to="/reservations/rules/list" className="fz-btn-secondary">Cancel</Link>
            <button type="button" className="fz-btn-primary" onClick={() => window.history.back()}>
              {isNew ? 'Create rule' : 'Save rule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
