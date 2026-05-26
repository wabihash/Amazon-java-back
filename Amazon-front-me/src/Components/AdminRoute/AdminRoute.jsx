import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from '../../Components/DataProvider/DataProvider';

const AdminRoute = ({ children }) => {
    const navigate = useNavigate();
    const [{ user, authLoading }] = useContext(DataContext);

    useEffect(() => {
        // Wait for auth to finish loading before checking permissions
        if (!authLoading) {
            if (!user) {
                navigate("/auth", { state: { msg: "You must be logged in to access the admin panel", redirect: "/admin" } });
            } else if (user.role !== "admin") {
                navigate("/", { state: { msg: "Access Denied: You do not have administrator privileges" } });
            }
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return null; // Or a loader component
    }

    // Only render children if user is logged in and is an admin
    return user && user.role === "admin" ? children : null;
};

export default AdminRoute;
