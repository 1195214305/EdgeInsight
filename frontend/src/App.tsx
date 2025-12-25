import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WorkspacePage from './pages/WorkspacePage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
