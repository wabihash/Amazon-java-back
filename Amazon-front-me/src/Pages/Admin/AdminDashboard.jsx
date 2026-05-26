import React from 'react';
import LayOut from '../../Components/LayOut/LayOut';
import { LineChart, PieChart, BarChart } from '@mui/x-charts';
import './AdminDashboard.css';

import { Link } from 'react-router-dom';
import { FaRobot, FaChevronRight } from 'react-icons/fa';

const AdminDashboard = () => {
    // Mock data for sales
    const revenueData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
    const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Mock data for order status
    const statusData = [
        { id: 0, value: 10, label: 'Pending', color: '#ff9900' },
        { id: 1, value: 15, label: 'Completed', color: '#2e7d32' },
        { id: 2, value: 5, label: 'Cancelled', color: '#d32f2f' },
    ];

    // Mock data for user growth
    const userData = [20, 35, 45, 60, 75, 90, 110];

    return (
        <LayOut>
            <div className="admin__container">
                <h1>Store Overview</h1>
                
                {/* Stats Section */}
                <div className="admin__stats">
                    <div className="stat__card">
                        <h4>Total Revenue</h4>
                        <div className="stat__value">$24,892.00</div>
                        <div className="stat__growth">↑ 12% from last week</div>
                    </div>
                    <div className="stat__card" style={{borderLeftColor: '#febd69'}}>
                        <h4>Total Orders</h4>
                        <div className="stat__value">1,240</div>
                        <div className="stat__growth">↑ 8% from last week</div>
                    </div>
                    <div className="stat__card" style={{borderLeftColor: '#2e7d32'}}>
                        <h4>Active Users</h4>
                        <div className="stat__value">856</div>
                        <div className="stat__growth">↑ 15% from last week</div>
                    </div>
                    <div className="stat__card" style={{borderLeftColor: '#ff9900'}}>
                        <h4>Total Products</h4>
                        <div className="stat__value">142</div>
                        <div className="stat__growth">Stable</div>
                    </div>
                </div>

                <div className="admin__grid">
                    {/* Revenue Line Chart */}
                    <div className="admin__card full-width">
                        <h3>Revenue Trends (Weekly)</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <LineChart
                                series={[
                                    { data: revenueData, label: 'Revenue ($)', area: true, color: '#ff9900' },
                                ]}
                                xAxis={[{ scaleType: 'point', data: xLabels }]}
                            />
                        </div>
                    </div>

                    {/* Order Status Pie Chart */}
                    <div className="admin__card">
                        <h3>Order Status Distribution</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <PieChart
                                series={[
                                    {
                                        data: statusData,
                                        innerRadius: 40,
                                        outerRadius: 100,
                                        paddingAngle: 5,
                                        cornerRadius: 5,
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    {/* User Growth Bar Chart */}
                    <div className="admin__card">
                        <h3>New User Acquisition</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <BarChart
                                xAxis={[{ scaleType: 'band', data: xLabels }]}
                                series={[{ data: userData, label: 'New Users', color: '#febd69' }]}
                            />
                        </div>
                    </div>
                </div>

                {/* AI Assistant Navigation Card */}
                <Link to="/admin/ai-center" className="admin__card ai_nav_card">
                    <div className="ai_card_content">
                        <div className="ai_icon_box">
                            <FaRobot />
                        </div>
                        <div className="ai_text_box">
                            <h3>AI Command Center</h3>
                            <p>Manage your assistant's personality, bio, and site knowledge base.</p>
                        </div>
                        <FaChevronRight className="nav_arrow" />
                    </div>
                </Link>
            </div>
        </LayOut>
    );
};

export default AdminDashboard;
