import { Link } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import './fzReservations.css';

/** FZ Reservations → Guide (help topic hub for BMP demo) */
export function GuidePage() {
  return (
    <div className="fz-res-page">
      <PageTitle title="Reservations guide" />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100 fz-guide">
          <section className="fz-guide__section">
            <h2>Overview</h2>
            <p>
              The Reservations module lets partners hold ticket inventory and send payment links to recipients.
              For Burning Man BMP, <strong>reduced-price crew tickets</strong> are issued as{' '}
              <code>to_be_paid</code> reservations after TRS approval.
            </p>
          </section>

          <section className="fz-guide__section">
            <h2>End-to-end flow (this prototype)</h2>
            <ol className="fz-guide__steps">
              <li>
                <strong>Ticket requests → Recipients</strong> — Group lead uploads crew list
              </li>
              <li>
                <strong>Ticket requests → Requests</strong> — Submit reduced-price ticket request
              </li>
              <li>
                <strong>Ticket requests → Approvals</strong> — Approver confirms quantity
              </li>
              <li>
                <strong>Reservations → Overview</strong> — Reservation appears with locator + status
              </li>
              <li>
                <strong>Send payment link</strong> — Email template <code>m_b2b_pay_reservation</code> with purchase URL
              </li>
              <li>
                <strong>Recipient pays</strong> — External checkout or FZ checkout → order confirmation
              </li>
            </ol>
          </section>

          <section className="fz-guide__section">
            <h2>Key screens</h2>
            <ul>
              <li><Link to="/reservations/list">Overview</Link> — Search, filter, export, make reservation</li>
              <li><Link to="/reservations/rules/list">Rules</Link> — Expiration & capacity per business type</li>
              <li><Link to="/reservations/businesses">Businesses</Link> — Theme camps / crews as B2B businesses</li>
            </ul>
          </section>

          <section className="fz-guide__section">
            <h2>Reservation statuses</h2>
            <table className="fz-guide__table">
              <thead>
                <tr><th>Status</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td><code>to_be_paid</code></td><td>Cart held; payment link active until expiration</td></tr>
                <tr><td><code>paid</code></td><td>Order created; ticket delivery triggered</td></tr>
                <tr><td><code>cancelled</code></td><td>Released by partner or system</td></tr>
                <tr><td><code>expired</code></td><td>Payment window closed per rules</td></tr>
              </tbody>
            </table>
          </section>

          <section className="fz-guide__section fz-guide__section--muted">
            <p>
              Production reference: FeverZone <code>feverzoneclient</code> module{' '}
              <code>src/app/modules/reservation/</code> · Backend <code>fever2</code> reservation domain.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
