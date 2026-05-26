import React, { useContext } from 'react';
import LayOut from '../../Components/LayOut/LayOut';
import { DataContext } from '../../Components/DataProvider/DataProvider';
import ProductCard from '../../Components/Product/ProductCard';
import './Wishlist.css';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const [{ wishlist }] = useContext(DataContext);

    return (
        <LayOut>
            <div className="wishlist__container">
                <div className="wishlist__header">
                    <h1>Your Wishlist</h1>
                    <p>{wishlist?.length || 0} items saved</p>
                </div>

                {wishlist?.length === 0 ? (
                    <div className="wishlist__empty">
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🤍</div>
                        <h2>Your Wishlist is empty</h2>
                        <p>Save items you're waiting for. They'll appear here so you can find them easily.</p>
                        <Link to="/" className="wishlist__shopButton">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist__grid">
                        {wishlist?.map((item) => (
                            <ProductCard 
                                key={item.id} 
                                product={item} 
                                renderAdd={true} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </LayOut>
    );
};

export default Wishlist;
