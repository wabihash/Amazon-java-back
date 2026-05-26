import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from './Pages/Landing/Landing';
import Auth from './Pages/Auth/Auth';
import Payment from './Pages/Payment/Payment';
import Orders from './Pages/Orders/Orders';
import Cart from './Pages/Cart/Cart';
import Results from './Pages/Results/Results'
import ProductDetail from "./Pages/productDetail/ProductDetail";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute/AdminRoute";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AICommandCenter from "./Pages/Admin/AICommandCenter";
import Wishlist from "./Pages/Wishlist/Wishlist";
import ComingSoon from "./Pages/ComingSoon/ComingSoon";

// Initialized once at module level — never recreated on re-render
const stripePromise = loadStripe("pk_test_51SjZSHHqUsHBM45rMWJNPOfwgTo7DnlEeOhNGsDlB7cioouB1jo6sqwJPcptPjpz2fUOXQf9d5Od1DDQsaD6QMbz00lsennkHX");

function Routing() {
    return (
        <Router>  
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/payments" element={
                    <ProtectedRoute msg="You need to login to proceed to payment" redirect="/payments">
                    <Elements stripe={stripePromise}>
                         <Payment />
                        </Elements>
                    </ProtectedRoute>
                }/>
                <Route path="/orders" element={
                    <ProtectedRoute msg="You need to login to view orders" redirect="/orders">
                        <Orders />
                    </ProtectedRoute>
                } />
                <Route path="/category/:categoryName" element={<Results />} />
                <Route path="/search/:searchQuery" element={<Results />} />
                <Route path="/product/:productId" element={<ProductDetail />} />

                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />
                <Route path="/admin/ai-center" element={
                    <AdminRoute>
                        <AICommandCenter />
                    </AdminRoute>
                } />
                <Route path="/wishlist" element={
                    <ProtectedRoute msg="You need to login to view your wishlist" redirect="/wishlist">
                        <Wishlist />
                    </ProtectedRoute>
                } />


                <Route path="/coming-soon" element={<ComingSoon />} />
            </Routes>
        </Router>
    );
}

export default Routing;