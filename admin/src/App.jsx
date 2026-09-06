import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'
import Login from './Pages/Login/Login'
import { Navigate, Route, Routes } from 'react-router-dom'
import ChangePassword from './Pages/ChangePassword/ChangePassword'

const App = () => {
  const isAuthenticated = Boolean(localStorage.getItem('admin-token'))

  if (!isAuthenticated) {
    return <Routes><Route path="*" element={<Login />} /></Routes>
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/settings/password" element={<ChangePassword />} />
        <Route path="*" element={<Admin />} />
      </Routes>
    </div>
  )
}

export default App
