import { Link, useParams } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { BUSINESS_TYPE_LABELS, SEED_BUSINESSES } from './businessModel';
import './fzReservations.css';

/** FZ businesses/new and businesses/:id — mirrors business-form.component */
export function BusinessFormPage() {
  const { id } = useParams();
  const isCreate = !id || id === 'new';
  const business = !isCreate ? SEED_BUSINESSES.find((b) => b.id === id) : undefined;

  if (!isCreate && !business) {
    return (
      <div className="fz-res-page">
        <PageTitle title="Business" section="Businesses" sectionLink="/reservations/businesses" />
        <p className="main-wrapper">Business not found.</p>
      </div>
    );
  }

  return (
    <div className="fz-res-page">
      <PageTitle
        title={isCreate ? 'Add business' : business!.name}
        section="Businesses"
        sectionLink="/reservations/businesses"
      />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100 fz-business-form">
          <label className="gl-field">
            <span className="gl-field__label">Business name</span>
            <input className="gl-input" type="text" defaultValue={business?.name ?? ''} />
          </label>
          <label className="gl-field">
            <span className="gl-field__label">Department</span>
            <select className="gl-select" defaultValue={business?.type ?? 'placement'}>
              {Object.entries(BUSINESS_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="gl-field">
            <span className="gl-field__label">Email</span>
            <input className="gl-input" type="email" defaultValue={business?.email ?? ''} />
          </label>
          <label className="gl-field">
            <span className="gl-field__label">Contact name</span>
            <input className="gl-input" type="text" defaultValue={business?.contactName ?? ''} />
          </label>
          <label className="gl-field">
            <span className="gl-field__label">Phone</span>
            <input className="gl-input" type="tel" defaultValue={business?.phone ?? ''} />
          </label>
          <label className="gl-field">
            <span className="gl-field__label">Address</span>
            <input className="gl-input" type="text" defaultValue={business?.address ?? ''} />
          </label>

          <div className="fz-business-form__actions">
            <Link to="/reservations/businesses" className="gl-btn-secondary">Cancel</Link>
            <button type="button" className="gl-btn-primary" onClick={() => window.history.back()}>
              {isCreate ? 'Create business' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
