import React, { useContext } from 'react';
import LayOut from '../../Components/LayOut/LayOut';
import { DataContext } from '../../Components/DataProvider/DataProvider';
import CurrencyFormat from '../../Components/Product/CurrencyFormat';
import { Link } from 'react-router-dom';
import classes from './Cart.module.css';
import ProductCard from '../../Components/Product/ProductCard';

function Cart() {
    const [{ basket, user }] = useContext(DataContext);
    const total = basket.reduce(
        (amount, item) => item.price * item.quantity + amount,
        0
    );

    return (
        <LayOut>
            <section className={classes.container}>
                <div className={classes.cart__container}>
                    <h2>Hello, {user?.firstName || user?.email?.split('@')[0] || 'Guest'}</h2>
                    <h3>Your Shopping Basket</h3>

                    {basket?.length === 0 ? (
                        <p className={classes.empty__cart}>🛒 Your basket is empty</p>
                    ) : (
                        basket?.map((item) => (
                            <ProductCard
                                key={item.id}
                                product={item}
                                renderAdd={false}
                            />
                        ))
                    )}
                </div>

                {basket?.length !== 0 && (
                    <div className={classes.subtotal}>
                        <div>
                            <p>Subtotal ({basket?.length} {basket?.length === 1 ? 'item' : 'items'})</p>
                            <CurrencyFormat amount={total} />
                        </div>
                        <span>
                            <input type="checkbox" id="gift" />
                            <label htmlFor="gift">This order contains a gift</label>
                        </span>
                        <Link to="/payments" className={classes.checkout_button}>
                            Continue to Checkout
                        </Link>
                    </div>
                )}
            </section>
        </LayOut>
    );
}

export default Cart;