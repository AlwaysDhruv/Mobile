import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Header from './components/Header.jsx';

import SellerLayout from "./layouts/SellerLayout.jsx";
import SellerDashboard from "./pages/seller/Dashboard.jsx";
import SellerProducts from "./pages/seller/Products.jsx";
import SellerCategories from "./pages/seller/Categories.jsx";
import SellerUsers from "./pages/seller/Users.jsx";
import SellerOrders from "./pages/seller/Orders.jsx";
import SellerRiders from "./pages/seller/Riders.jsx";
import ProtectedSellerRoute from "./components/ProtectedSellerRoute.jsx";
import AddProduct from "./pages/seller/AddProduct.jsx";
import ViewProduct from "./pages/seller/ViewProduct.jsx";
import AddCategory from "./pages/seller/AddCategory.jsx";
import EditCategory from "./pages/seller/EditCategory.jsx";
import SellerMail from "./pages/seller/MailPage.jsx";
import SellerStoreInfo from "./pages/seller/SellerStoreInfo.jsx";

import RiderLayout from "./layouts/RiderLayout.jsx";
import RiderDashboard from "./pages/rider/RiderDashboard.jsx";
import RiderOrders from "./pages/rider/RiderOrders.jsx";
import RiderStores from "./pages/rider/RiderStores.jsx";
import ProtectedRiderRoute from "./components/ProtectedRiderRoute.jsx";
import RiderMail from "./pages/rider/RiderMail.jsx";

import BuyerLayout from "./layouts/BuyerLayout.jsx";
import BuyerHome from "./pages/buyer/BuyerHome.jsx";
import BuyerCart from "./pages/buyer/BuyerCart.jsx";
import BuyerOrders from "./pages/buyer/BuyerOrders.jsx";
import BuyerProfile from "./pages/buyer/BuyerProfile.jsx";
import ProtectedBuyerRoute from "./components/ProtectedBuyerRoute.jsx";
import StoreProfile from "./pages/buyer/StoreProfile.jsx";

export default function App() {
  const location = useLocation();

  // Hide Header on dashboard layouts
  const hideHeader =
    location.pathname.startsWith("/seller") ||
    location.pathname.startsWith("/rider") ||
    location.pathname.startsWith("/buyer");

  return (
    <div>
      {!hideHeader && <Header />}

      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* SELLER PANEL */}
        <Route
          path="/seller"
          element={
            <ProtectedSellerRoute>
              <SellerLayout />
            </ProtectedSellerRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id" element={<ViewProduct />} />
          <Route path="categories" element={<SellerCategories />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/edit/:id" element={<EditCategory />} />
          <Route path="users" element={<SellerUsers />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="riders" element={<SellerRiders />} />
          <Route path="mail" element={<SellerMail />} />
          <Route path="store" element={<SellerStoreInfo />} />
        </Route>

        {/* RIDER PANEL */}
        <Route
          path="/rider"
          element={
            <ProtectedRiderRoute>
              <RiderLayout />
            </ProtectedRiderRoute>
          }
        >
          <Route index element={<RiderDashboard />} />
          <Route path="orders" element={<RiderOrders />} />
          <Route path="stores" element={<RiderStores />} />
          <Route path="mail" element={<RiderMail />} />
        </Route>

        {/* BUYER PANEL */}
        <Route
          path="/buyer"
          element={
            <ProtectedBuyerRoute>
              <BuyerLayout />
            </ProtectedBuyerRoute>
          }
        >
          <Route index element={<BuyerHome />} />
          <Route path="cart" element={<BuyerCart />} />
          <Route path="orders" element={<BuyerOrders />} />
          <Route path="profile" element={<BuyerProfile />} />

          {/* ⭐ NEW STORE PROFILE ROUTE ⭐ */}
          <Route path="store/:storeId" element={<StoreProfile />} />
        </Route>

      </Routes>
    </div>
  );
}
