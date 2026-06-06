import { Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"     element={<LandingPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}
