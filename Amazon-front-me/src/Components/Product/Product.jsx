import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import classes from "./Product.module.css";
import SkeletonCard from "../Loader/Skeleton"; 

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://fakestoreapi.com/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className={classes.products_container}>
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </section>
    );
  }

  return (
    
      <section className={classes.products_container}>
        {products.map((product) => (
          <ProductCard  renderAdd={true} product={product} key={product.id} />
        ))}
      </section>
   
  );
};

export default Product;
