import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FzContextBar } from '../components/FzContextBar';
import { useTrs } from '../../trs/TrsProvider';
import {
  ModifySummaryAside,
  ModifySummaryHeader,
  ModifyTicketCard,
  ReservationBreadcrumb,
} from './ReservationDetailBlocks';
import { findReservationByKey } from './reservationLookup';

/** FZ list/:reservationId/modify — production modify flow */
export function ModifyReservationPage() {
  const { reservationId } = useParams();
  const { state } = useTrs();
  const reservation = findReservationByKey(state.reservations, reservationId);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (reservation) setQuantity(reservation.totalNumberOfTickets);
  }, [reservation?.id, reservation?.totalNumberOfTickets]);

  if (!reservation) {
    return (
      <div className="fz-res-page">
        <FzContextBar sectionLabel="Reservations" />
        <div className="main-wrapper">
          <p>Reservation not found.</p>
          <Link to="/reservations/list" className="fz-btn-secondary">Back to list</Link>
        </div>
      </div>
    );
  }

  const detailPath = `/reservations/list/${reservation.id}`;
  const tz = reservation.timezone;

  if (reservation.status !== 'to_be_paid') {
    return (
      <div className="fz-res-page">
        <FzContextBar sectionLabel="Reservations" />
        <div className="main-wrapper">
          <ReservationBreadcrumb reservationId={reservation.id} locator={reservation.locator} tail="Modify" />
          <div className="fz-res-alert fz-res-alert--warning">
            Only unpaid reservations can be modified.
          </div>
          <Link to={detailPath} className="fz-btn-secondary fz-res-inline-cta">Back to reservation</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fz-res-page fz-res-page--modify">
      <FzContextBar sectionLabel="Reservations" />

      <div className="fz-res-modify-prod__hero">
        <div className="fz-res-modify-prod__hero-inner">
          <ReservationBreadcrumb
            reservationId={reservation.id}
            locator={reservation.locator}
            tail="Modify"
            variant="dark"
          />
          <h1 className="fz-res-modify-prod__page-title">Modify reservation</h1>
        </div>
      </div>

      <div className="fz-res-modify-prod__info-bar">
        <div className="fz-res-modify-prod__info-inner">
          <ModifySummaryHeader reservation={reservation} backHref={detailPath} />
        </div>
      </div>

      <div className="main-wrapper fz-res-modify-prod-wrap">
        <div className="fz-res-modify-prod__workspace">
          <section className="fz-res-modify-prod__main">
            <h2 className="fz-res-modify-prod__section-title">What do you want to change?</h2>
            <p className="fz-res-modify-prod__section-desc">
              Add or remove tickets, include new tickets, even new dates, or move tickets from one date to another.
            </p>
            <button type="button" className="fz-res-modify-prod__add-btn">
              + Add new ticket types
            </button>
            <ModifyTicketCard
              reservation={reservation}
              quantity={quantity}
              onQuantityChange={setQuantity}
              timezone={tz}
            />
          </section>
          <ModifySummaryAside reservation={reservation} quantity={quantity} />
        </div>
      </div>
    </div>
  );
}
