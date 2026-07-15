import { Link } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { SEED_BUSINESSES } from './businessModel';
import './fzReservations.css';

/** FZ reservations/create-on-behalf — mirrors new-reservation-on-behalf-of-business */
export function CreateOnBehalfPage() {
  return (
    <div className="fz-res-page">
      <PageTitle title="Make reservation" section="Overview" sectionLink="/reservations/list" />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100 fz-create-on-behalf">
          <p className="fz-create-on-behalf__intro">
            Select a business to reserve tickets on their behalf. In BMP, most reservations are created automatically
            when TRS approves reduced-price ticket requests.
          </p>

          <div className="fz-create-on-behalf__list">
            {SEED_BUSINESSES.map((b) => (
              <Link
                key={b.id}
                to={`/reservations/create-on-behalf/${b.id}`}
                className="fz-create-on-behalf__card"
              >
                <strong>{b.name}</strong>
                <span>{b.email}</span>
              </Link>
            ))}
          </div>

          <Link to="/reservations/list" className="gl-btn-secondary">Back to overview</Link>
        </div>
      </div>
    </div>
  );
}

/** FZ create-on-behalf/:businessId — choose event */
export function CreateOnBehalfEventPage() {
  return (
    <div className="fz-res-page">
      <PageTitle title="Choose event" section="Overview" sectionLink="/reservations/list" />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100 fz-create-on-behalf">
          <Link
            to="/reservations/create/make-reservation"
            className="fz-create-on-behalf__card fz-create-on-behalf__card--event"
          >
            <strong>Burning Man 2026</strong>
            <span>Black Rock City · Aug 25, 2026</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** FZ create/make-reservation — cart builder stub */
export function CreateReservationPage() {
  return (
    <div className="fz-res-page">
      <PageTitle title="Make reservation" section="Overview" sectionLink="/reservations/list" />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100 fz-create-on-behalf">
          <p className="fz-res-alert fz-res-alert--info">
            Manual reservation creation is stubbed in this prototype. Use the TRS approval flow to generate{' '}
            <code>to_be_paid</code> reservations for crew tickets.
          </p>
          <label className="gl-field">
            <span className="gl-field__label">Session</span>
            <select className="gl-select" defaultValue="crew">
              <option value="crew">Stellar · Directed crew ticket</option>
            </select>
          </label>
          <label className="gl-field">
            <span className="gl-field__label">Recipient email</span>
            <input className="gl-input" type="email" placeholder="crew@example.com" />
          </label>
          <div className="fz-business-form__actions">
            <Link to="/reservations/list" className="gl-btn-secondary">Cancel</Link>
            <button type="button" className="gl-btn-primary" disabled title="Use TRS approval flow">
              Create reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
