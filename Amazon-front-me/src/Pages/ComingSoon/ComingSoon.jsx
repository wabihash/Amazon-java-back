import React from 'react';
import { Link } from 'react-router-dom';
import LayOut from '../../Components/LayOut/LayOut';
import classes from './ComingSoon.module.css';

function ComingSoon() {
  return (
    <LayOut>
      <section className={classes.coming__section}>
        <div className={classes.coming__card}>
          <span className={classes.coming__icon}>🚧</span>
          <span className={classes.coming__badge}>Coming Soon</span>
          <h1>We're Working on It!</h1>
          <p>
            This feature is currently under development and will be available soon.
            Stay tuned for exciting updates!
          </p>
          <Link to="/" className={classes.coming__back}>
            ← Back to Home
          </Link>
        </div>
      </section>
    </LayOut>
  );
}

export default ComingSoon;
