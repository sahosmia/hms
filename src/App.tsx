import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { ClinicalBedProvider } from './context/ClinicalBedProvider';
import { OTInventoryProvider } from './context/OTInventoryContext';
import { FinanceProvider } from './context/FinanceContext';
import { StaffProvider } from './context/StaffContext';
import { EmployeeFinanceProvider } from './context/EmployeeFinanceContext';
import { AppRoutes } from './routes/AppRoutes';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppointmentProvider>
          <ClinicalBedProvider>
            <OTInventoryProvider>
              <FinanceProvider>
                <StaffProvider>
                  <EmployeeFinanceProvider>
                    <AppRoutes />
                  </EmployeeFinanceProvider>
                </StaffProvider>
              </FinanceProvider>
            </OTInventoryProvider>
          </ClinicalBedProvider>
        </AppointmentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
