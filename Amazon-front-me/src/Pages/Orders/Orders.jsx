import React, { useContext, useState, useEffect } from "react";
import LayOut from "../../Components/LayOut/LayOut";
import classes from "./Orders.module.css";
import { db } from "../../Utility/Firebase.jsx";
import { DataContext } from '../../Components/DataProvider/DataProvider';
import ProductCard from "../../Components/Product/ProductCard.jsx";

function Orders() {
    const [{ user }] = useContext(DataContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        let unsubscribe;
        if (user) {
            unsubscribe = db.collection("users")
                .doc(user.uid)
                .collection("orders")
                .orderBy("created", "desc")
                .onSnapshot((snapshot) => {
                    setOrders(
                        snapshot.docs.map((doc) => ({
                            id: doc.id,
                            data: doc.data(),
                        }))
                    );
                }, (error) => {
                    console.error("Orders Snapshot Error:", error);
                });
        } else {
            setOrders([]);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        }
    }, [user]);

    return (
        <LayOut>
            <section className={classes.section}>
                <div className={classes.orders__container}>
                    <h2>Your Orders</h2>

                    {orders?.length === 0 && (
                        <p className={classes.empty__msg}>No orders found. Start shopping!</p>
                    )}

                    {orders?.map((eachOrder) => (
                        <div key={eachOrder.id} className={classes.order__card}>
                            {/* Order header row */}
                            <div className={classes.order__card__header}>
                                <span className={classes.order__id}>
                                    Order ID: {eachOrder?.id}
                                </span>
                            </div>

                            {/* Order items */}
                            <div className={classes.order__items}>
                                {eachOrder?.data?.basket?.map((order) => (
                                    <ProductCard
                                        product={order}
                                        key={order.id}
                                        isOrder={true}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </LayOut>
    );
}

export default Orders;