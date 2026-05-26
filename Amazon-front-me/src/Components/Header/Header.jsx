import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { FaShoppingCart } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import classes from './Header.module.css';
import LowerHeader from './LowerHeader';
import { DataContext } from '../DataProvider/DataProvider';
import {auth} from '../../Utility/Firebase'
import ThemeToggle from '../Theme/ThemeToggle';

function Header() {
  const [{ basket, user, wishlist, authLoading }] = useContext(DataContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // ✅ total items = sum of quantities
  const totalItems = basket.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (selectedCategory === 'all') {
        navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/category/${selectedCategory}?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };
  return (
    <section className={classes.stickyWrapper}>
      <div className={classes.header_container}>
        {/* LEFT */}
        <div className={classes.logo_container}>
          <Link to="/">
            <img src="/amazon_PNG11.png" alt="Amazon Logo" />
          </Link>
          <ThemeToggle />

          <div className={classes.delivery}>
            <span>
              <HiOutlineLocationMarker />
            </span>
            <div>
              <p>Delivered to</p>
              <strong>Ethiopia</strong>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className={classes.search}>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
            <option value="jewelery">Jewelry</option>
            <option value="men's clothing">Men's Clothing</option>
            <option value="women's clothing">Women's Clothing</option>
          </select>
          <input 
            type="text" 
            placeholder="Search Amazon" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <FaSearch className={classes.searchIcon} onClick={handleSearch} />
        </div>

        {/* RIGHT */}
        <div className={classes.order_container}>
          <div className={classes.language}>
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.o6qGMJjK3eeBHQYMGaV3pQHaEC"
              alt="Language"
            />
            <select>
              <option value="en">En</option>
              <option value="oro">ORO</option>
              <option value="fr">Amh</option>
            </select>
          </div>

          <Link to={!user && "/auth"}>
            <div>
              {
                user ? ( 
                  <>
                    <p>Hello, {user?.firstName || user?.email?.split("@")[0]}</p>
                    <span onClick={()=>auth.signOut()}>Sign Out</span>
                  </>
                
                ) : (
                    <>
                    <p>Hello, {authLoading ? "..." : "Sign In"}</p>
                    <span>Account & Lists</span>
                    </>
                    
                )
             }
            </div>
           
          </Link>

          <Link to="/orders" className={classes.account}>
            <p>Returns</p>
            <span>& Orders</span>
          </Link>

          {/* WISHLIST */}
          <Link to="/wishlist" className={classes.account}>
            <p>Your</p>
            <span>Wishlist ({wishlist?.length || 0})</span>
          </Link>

          {/* ADMIN */}
          {user?.role === 'admin' && (
            <Link to="/admin" className={classes.account}>
              <p>Admin</p>
              <span>Panel</span>
            </Link>
          )}

          {/* CART */}
          <Link to="/cart" className={classes.cart}>
            <FaShoppingCart size={20} />
            <span>{totalItems}</span>
          </Link>
        </div>
      </div>

      <LowerHeader />
    </section>
  );
}

export default Header;
