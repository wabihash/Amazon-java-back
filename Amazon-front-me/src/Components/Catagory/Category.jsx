import React from "react";
import { Link } from "react-router-dom"; // ✅ Import Link
import { categories } from "./CategoryData.jsx";
import classes from "./Category.module.css";

function Category() {
  return (
    <section className={classes.categories}>
      {categories.map((cat) => (
        <div key={cat.id} className={classes.card}>
         <Link to={`/category/${cat.value}`}>
 {/* ✅ Capital L */}
            <h3>{cat.title}</h3>
            <img src={cat.image} alt={cat.title} />
            <p>Shop now</p>
          </Link>
        </div>
      ))}
    </section>
  );
}

export default Category;
