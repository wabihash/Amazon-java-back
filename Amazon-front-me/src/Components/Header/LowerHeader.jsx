import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import classes from './LowerHeader.module.css';

// Category links shared by both desktop nav and mobile dropdown
const NAV_LINKS = [
  { label: 'Electronics', to: '/category/electronics' },
  { label: 'Jewelry', to: '/category/jewelery' },
  { label: "Men's Fashion", to: "/category/men's%20clothing" },
  { label: "Women's Fashion", to: "/category/women's%20clothing" },
  { label: "Today's Deals", to: '/coming-soon' },
  { label: 'Customer Service', to: '/coming-soon' },
  { label: 'Registry', to: '/coming-soon' },
  { label: 'Gift Cards', to: '/coming-soon' },
  { label: 'Sell', to: '/coming-soon' },
];

function LowerHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Close menu when a link is clicked
  const handleLinkClick = () => setIsOpen(false);

  return (
    <div className={classes.lower__container}>

      {/* ===== MOBILE: Hamburger button ===== */}
      <button className={classes.hamburger__btn} onClick={toggleMenu} aria-label="Toggle menu">
        <span className={classes.hamburger__icon}>
          {isOpen ? '✕' : '☰'}
        </span>
        <span>{isOpen ? 'Close' : 'All Categories'}</span>
      </button>

      {/* Mobile dropdown */}
      <div className={`${classes.mobile__menu} ${isOpen ? classes.open : ''}`}>
        {NAV_LINKS.map((link) => (
          <Link key={link.label} to={link.to} onClick={handleLinkClick}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* ===== DESKTOP: Horizontal nav ===== */}
      <ul className={classes.nav__list} style={{ flexWrap: 'wrap' }}>
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default LowerHeader;