import React, { useEffect, useState, useContext } from 'react';
import classes from './ProductDetail.module.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { productUrl } from '../../API/Endpoint';
import LayOut from '../../Components/LayOut/LayOut';
import Loader from '../../Components/Loader/Loader';
import Rating from "@mui/material/Rating";
import CurrencyFormat from '../../Components/Product/CurrencyFormat';
import { DataContext } from '../../Components/DataProvider/DataProvider';
import { Type } from '../../Utility/ActionType';

function ProductDetail({ renderAdd = true }) { // <-- added renderAdd prop
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [, dispatch] = useContext(DataContext);

    useEffect(() => {
        setLoading(true);
        axios.get(`${productUrl}/products/${productId}`)
            .then((res) => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [productId]);

    const addToCart = () => {
        dispatch({
            type: Type.ADD_TO_BASKET,
            item: { 
                id: product.id, 
                title: product.title, 
                image: product.image, 
                price: product.price, 
                rating: product.rating 
            },
        });
    };

    if (loading) {
        return (
            <LayOut>
                <Loader />
            </LayOut>
        );
    }

    return (
        <LayOut>
            <div className={classes.product_detail_container}>
                <div className={classes.product_image}>
                    <img src={product.image} alt={product.title} />
                </div>
                <div className={classes.product_info}>
                    <h1 className={classes.product_title}>{product.title}</h1>
                    <div className={classes.product_rating}>
                        <Rating value={product.rating?.rate || 0} precision={0.1} readOnly />
                        <span className={classes.review_count}>
                            ({product.rating?.count || 0} reviews)
                        </span>
                    </div>
                    <div className={classes.product_price}>
                        <CurrencyFormat amount={product.price} />
                    </div>
                    <div className={classes.product_description}>
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    {renderAdd && (  // <-- only change: conditional button
                        <button className={classes.button} onClick={addToCart}>
                            Add to Cart
                        </button>
                    )}

                </div>
            </div>
        </LayOut>
    );
}

export default ProductDetail;

