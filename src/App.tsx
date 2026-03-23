import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RizeApp from './RizeApp'
import { LandingPage } from './site/LandingPage'
import { PrivacyPage } from './site/PrivacyPage'
import { TermsPage } from './site/TermsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<RizeApp />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
