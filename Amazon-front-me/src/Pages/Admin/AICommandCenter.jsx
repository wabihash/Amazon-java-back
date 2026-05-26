import React, { useState, useEffect } from 'react';
import { db } from '../../Utility/Firebase';
import LayOut from '../../Components/LayOut/LayOut';
import classes from './AICommandCenter.module.css';
import { FaSave, FaRobot, FaInfoCircle, FaArrowLeft, FaMagic, FaBrain } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AICommandCenter = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        assistantName: 'Amazon AI',
        developerBio: 'Wabi - Full Stack Developer',
        siteFeatures: 'Shopping Cart, Wishlist, Stripe Checkout, Firebase Auth, Admin Panel',
        shippingInfo: 'Worldwide delivery (Ethiopia, USA, EU). 3-5 days standard.',
        returnPolicy: '30-day return policy for unopened items.',
        systemPrompt: 'You are a helpful and professional AI shopping assistant for Wabis Amazon Clone. You speak in a polite, efficient tone.'
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const doc = await db.collection('assistant_config').doc('main').get();
                if (doc.exists) {
                    setConfig(doc.data());
                }
            } catch (err) {
                console.error("Error fetching AI config:", err);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await db.collection('assistant_config').doc('main').set(config);
            toast.success("AI Knowledge Base Updated!");
        } catch (err) {
            toast.error("Failed to update AI: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayOut>
            <div className={classes.pageWrapper}>
                <div className={classes.container}>
                    <button onClick={() => navigate('/admin')} className={classes.backBtn}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>

                    <div className={classes.header}>
                        <div className={classes.titleArea}>
                            <div className={classes.iconCircle}>
                                <FaBrain />
                            </div>
                            <div>
                                <h1>AI Command Center</h1>
                                <p>Program your assistant's knowledge and personality</p>
                            </div>
                        </div>
                        <div className={classes.statusBadge}>
                            <span className={classes.dot}></span> Live Engine
                        </div>
                    </div>

                    <form onSubmit={handleSave} className={classes.modernForm}>
                        <div className={classes.sectionCard}>
                            <h3><FaRobot /> Identity & Persona</h3>
                            <div className={classes.inputRow}>
                                <div className={classes.inputGroup}>
                                    <label>Assistant Name</label>
                                    <input 
                                        name="assistantName" 
                                        value={config.assistantName} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Amazon AI"
                                    />
                                </div>
                                <div className={classes.inputGroup}>
                                    <label>Developer Identity</label>
                                    <input 
                                        name="developerBio" 
                                        value={config.developerBio} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Wabi - Full Stack Dev"
                                    />
                                </div>
                            </div>
                            <div className={classes.inputGroup}>
                                <label>AI Main Instructions (System Prompt)</label>
                                <textarea 
                                    name="systemPrompt" 
                                    className={classes.largeText}
                                    value={config.systemPrompt} 
                                    onChange={handleChange} 
                                    placeholder="Tell the AI how to behave..."
                                />
                            </div>
                        </div>

                        <div className={classes.sectionCard}>
                            <h3><FaMagic /> Knowledge Base</h3>
                            <div className={classes.inputGroup}>
                                <label>Key Site Features</label>
                                <textarea 
                                    name="siteFeatures" 
                                    value={config.siteFeatures} 
                                    onChange={handleChange} 
                                    placeholder="List features..."
                                />
                            </div>
                            <div className={classes.inputRow}>
                                <div className={classes.inputGroup}>
                                    <label>Shipping Info</label>
                                    <textarea 
                                        name="shippingInfo" 
                                        value={config.shippingInfo} 
                                        onChange={handleChange} 
                                        placeholder="Delivery locations..."
                                    />
                                </div>
                                <div className={classes.inputGroup}>
                                    <label>Return Policies</label>
                                    <textarea 
                                        name="returnPolicy" 
                                        value={config.returnPolicy} 
                                        onChange={handleChange} 
                                        placeholder="Refund info..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={classes.stickyFooter}>
                            <div className={classes.infoBox}>
                                <FaInfoCircle />
                                <span>Changes sync globally in real-time.</span>
                            </div>
                            <button type="submit" className={classes.saveBtn} disabled={loading}>
                                {loading ? "Updating AI..." : <><FaSave /> Deploy AI Updates</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </LayOut>
    );
};

export default AICommandCenter;
