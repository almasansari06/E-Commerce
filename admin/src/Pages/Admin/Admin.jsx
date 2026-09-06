import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Navigate, Routes, Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import Orders from '../Orders/Orders'
import Cancelled from '../Cancelled/Cancelled'
import Users from '../Users/Users'
import Coupons from '../Coupons/Coupons'
import Shuffle from '../Shuffle/Shuffle'

const Admin = () => {
  return (
    <div className="admin">
      <Sidebar/>
      <Routes>
        <Route path="/" element={<Navigate to="/addproduct" replace />} />
        <Route path="/addproduct" element={<AddProduct/>} />
        <Route path="/listproduct" element={<ListProduct/>} />
        <Route path="/orders" element={<Orders/>} />
        <Route path="/cancelled" element={<Cancelled/>} />
        <Route path="/users" element={<Users/>} />
        <Route path="/coupons" element={<Coupons/>} />
        <Route path="/shuffle" element={<Shuffle/>} />
      </Routes>
    </div>
  )
}

export default Admin

