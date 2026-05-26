import React from 'react';
import classes from './Footer.module.css';
import { FaGithub, FaLinkedin, FaFacebook, FaTelegram } from 'react-icons/fa';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className={classes.footer}>
            {/* Back to Top */}
            <div className={classes.backToTop} onClick={scrollToTop}>
                Back to Top
            </div>

            {/* Main Footer Links */}
            <div className={classes.footerLinks}>
                <div className={classes.column}>
                    <h3>Get to Know Us</h3>
                    <ul>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">About Amazon</a></li>
                        <li><a href="#">Investor Relations</a></li>
                    </ul>
                </div>

                <div className={classes.column}>
                    <h3>Make Money with Us</h3>
                    <ul>
                        <li><a href="#">Sell products on Amazon</a></li>
                        <li><a href="#">Sell on Amazon Business</a></li>
                        <li><a href="#">Become an Affiliate</a></li>
                        <li><a href="#">Advertise Your Products</a></li>
                    </ul>
                </div>

                <div className={classes.column}>
                    <h3>Amazon Payment Products</h3>
                    <ul>
                        <li><a href="#">Amazon Business Card</a></li>
                        <li><a href="#">Shop with Points</a></li>
                        <li><a href="#">Reload Your Balance</a></li>
                        <li><a href="#">Amazon Currency Converter</a></li>
                    </ul>
                </div>

                <div className={classes.column}>
                    <h3>Let Us Help You</h3>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Your Account</a></li>
                        <li><a href="#">Your Orders</a></li>
                        <li><a href="#">Shipping Rates & Policies</a></li>
                    </ul>
                </div>
            </div>

            {/* Developer Branding - CRITICAL for Portfolio */}
            <div className={classes.developerBranding}>
                <div className={classes.brandingContent}>
                    <img src="/amazon_PNG11.png" alt="Amazon Logo" className={classes.footerLogo} />
                    
                    <div className={classes.socialLinks}>
                        {/* Replace '#' with your actual links before deployment */}
                        <a href="https://github.com/wabihash/Amazon-front-me.git" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                        <a href="" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                        <a href="https://www.facebook.com/share/1C3mCXxzYP/" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                        <a href=" https://t.me/Focusrehobot" target="_blank" rel="noopener noreferrer"><FaTelegram /></a>
                    </div>
                    
                    <p className={classes.copy}>
                        Built with ❤️ by <strong>Wabi</strong>. 
                        © {new Date().getFullYear()} Amazon Clone - This is a portfolio project (Not the real Amazon).
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
