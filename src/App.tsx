import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { TrsProvider } from './trs/TrsProvider';

import { TrsFzLayout } from './trs/layout/TrsFzLayout';

import { AllocationPage } from './trs/pages/AllocationPage';

import { BulkRequestPage } from './trs/pages/BulkRequestPage';

import { ApprovalsPage } from './trs/pages/ApprovalsPage';

import { DistributionPage } from './trs/pages/DistributionPage';

import { RoleHome } from './trs/pages/RoleHome';

import { ReservationsListPage } from './fz/reservations/ReservationsListPage';

import { ReservationDetailPage } from './fz/reservations/ReservationDetailPage';
import { ModifyReservationPage } from './fz/reservations/ModifyReservationPage';



const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';



export default function App() {

  return (

    <BrowserRouter basename={basename}>

      <TrsProvider>

        <Routes>

          <Route element={<TrsFzLayout />}>

            <Route index element={<RoleHome />} />

            <Route path="allocation" element={<AllocationPage />} />

            <Route path="bulk-request" element={<BulkRequestPage />} />

            <Route path="approvals" element={<ApprovalsPage />} />

            <Route path="distribution" element={<DistributionPage />} />

            <Route path="reservations/list" element={<ReservationsListPage />} />

            <Route path="reservations/list/:reservationId" element={<ReservationDetailPage />} />
            <Route path="reservations/list/:reservationId/modify" element={<ModifyReservationPage />} />

          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </TrsProvider>

    </BrowserRouter>

  );

}


