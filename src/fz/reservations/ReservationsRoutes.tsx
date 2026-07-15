import { Navigate, Route, Routes } from 'react-router-dom';
import { ReservationsListPage } from './ReservationsListPage';
import { ReservationDetailPage } from './ReservationDetailPage';
import { ReservationCheckoutPage } from './ReservationCheckoutPage';
import { ModifyReservationPage } from './ModifyReservationPage';
import { PurchaseConfirmationPage } from './PurchaseConfirmationPage';
import { BusinessesPage } from './BusinessesPage';
import { BusinessFormPage } from './BusinessFormPage';
import { RulesListPage } from './RulesListPage';
import { RulesFormPage } from './RulesFormPage';
import { GuidePage } from './GuidePage';
import {
  CreateOnBehalfPage,
  CreateOnBehalfEventPage,
  CreateReservationPage,
} from './CreateReservationPages';

/**
 * FZ reservation module routes — order matches feverzoneclient reservation-routing.module.ts:
 * static paths first, then list/*, then dynamic :id/order last.
 */
export function ReservationsRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="list" replace />} />

      <Route path="list" element={<ReservationsListPage />} />
      <Route path="list/:reservationId/checkout" element={<ReservationCheckoutPage />} />
      <Route path="list/:reservationId/modify" element={<ModifyReservationPage />} />
      <Route path="list/:reservationId" element={<ReservationDetailPage />} />

      <Route path="businesses" element={<BusinessesPage />} />
      <Route path="businesses/new" element={<BusinessFormPage />} />
      <Route path="businesses/:id" element={<BusinessFormPage />} />

      <Route path="rules" element={<Navigate to="rules/list" replace />} />
      <Route path="rules/list" element={<RulesListPage />} />
      <Route path="rules/:ruleId" element={<RulesFormPage />} />

      <Route path="guide" element={<GuidePage />} />

      <Route path="create-on-behalf" element={<CreateOnBehalfPage />} />
      <Route path="create-on-behalf/:businessId" element={<CreateOnBehalfEventPage />} />
      <Route path="create" element={<CreateReservationPage />} />
      <Route path="create/make-reservation" element={<CreateReservationPage />} />

      <Route path=":reservationId/order" element={<PurchaseConfirmationPage />} />
    </Routes>
  );
}
