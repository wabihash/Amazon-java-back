import React, { useContext } from "react";
import Rating from "@mui/material/Rating";
import CurrencyFormat from "./CurrencyFormat";
import classes from "./Product.module.css";
import { Link } from "react-router-dom";
import { DataContext } from "../DataProvider/DataProvider";
import { Type } from "../../Utility/ActionType";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";

function ProductCard({ product = {}, renderAdd, isOrder }) {
  const { image, title, id, rating, price, quantity = 1 } = product;
  const [{ wishlist }, dispatch] = useContext(DataContext);
  
  const isWishlisted = wishlist?.some(item => item.id === id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      dispatch({ type: Type.REMOVE_FROM_WISHLIST, id });
      toast.info("Removed from wishlist");
    } else {
      dispatch({ type: Type.ADD_TO_WISHLIST, item: { id, title, image, price, rating } });
      toast.success("Added to wishlist!");
    }
  };

  const addToCart = () => {
    dispatch({
      type: Type.ADD_TO_BASKET,
      item: { id, title, image, price, rating },
    });
    toast.success("Added to cart!");
  };
  
  const decreaseQty = () => {
    dispatch({
      type: Type.DECREASE_QUANTITY,
      id,
    });
    // Only toast if it's the last item being removed
    if (quantity === 1) {
      toast.info("Removed from cart");
    }
  };

  return (
    
      <div className={classes.card__container}>
      {isOrder ? (
        <img src={image} alt={title} />
      ) : (
        <Link to={`/product/${id}`}>
          <img src={image} alt={title} />
        </Link>
      )}

      {!isOrder && (
        <div className={classes.wishlist__icon} onClick={toggleWishlist}>
          {isWishlisted ? <FaHeart color="#ff9900" /> : <FaRegHeart />}
        </div>
      )}

      <div className={classes.rating}>
        <h3>{title}</h3>

        <div className={classes.ratingStars}>
          <Rating value={rating?.rate || 0} precision={0.1} readOnly />
          <small>{rating?.count || 0} reviews</small>
        </div>

        <div>
          <CurrencyFormat amount={price * quantity} />
        </div>

        {/* PRODUCT PAGE / LIST PAGE */}
        {renderAdd && (
          <button className={classes.button} onClick={addToCart}>
            Add to Cart
          </button>
        )}

        {/* ORDER PAGE - Buy Again */}
        {isOrder && (
          <button className={classes.button} style={{ display: 'block', marginTop: '10px' }} onClick={addToCart}>
            Buy Again
          </button>
        )}

        {/* CART PAGE */}
       
      </div>
       {!renderAdd && !isOrder && (
          <div className={classes.quantity_controls}>
            <button onClick={decreaseQty}>−</button>
            <span>{quantity}</span>
            <button onClick={addToCart}>+</button>
          </div>
        )}
      </div>
      
    
    
  );
}

export default ProductCard;
