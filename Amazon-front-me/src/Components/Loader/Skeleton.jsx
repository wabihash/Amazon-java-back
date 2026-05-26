import React from 'react';
import classes from './Skeleton.module.css';

const SkeletonCard = () => {
  return (
    <div className={classes.skeleton_card}>
      <div className={`${classes.skeleton} ${classes.skeleton_img}`}></div>
      <div className={`${classes.skeleton} ${classes.skeleton_title}`}></div>
      <div className={`${classes.skeleton} ${classes.skeleton_rating}`}></div>
      <div className={`${classes.skeleton} ${classes.skeleton_price}`}></div>
      <div className={`${classes.skeleton} ${classes.skeleton_btn}`}></div>
    </div>
  );
};

export default SkeletonCard;
