import React, { useContext, useState } from 'react'
import classes from './Payment.module.css'
import LayOut from '../../Components/LayOut/LayOut'
import { DataContext } from '../../Components/DataProvider/DataProvider'
import ProductCard from '../../Components/Product/ProductCard'
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import CurrencyFormat from '../../Components/Product/CurrencyFormat'
import instance from '../../API/Axios'
import { ClipLoader } from 'react-spinners';
import { db } from '../../Utility/Firebase.jsx'
import { Type } from '../../Utility/ActionType.jsx'
import { useNavigate } from 'react-router-dom';

function Payment() {
  const [{ basket, user }, dispatch] = useContext(DataContext)
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const total = basket.reduce(
    (amount, item) => item.price * item.quantity + amount,
    0
  );
  const totalItems = basket.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleChange = (event) => {
  event?.error?.message ? setCardError(event?.error?.message) : setCardError("");
  };
  const handlePayment =  async(event) => {
    event.preventDefault();
    setCardError(null);
    try {
      if (!stripe || !elements) {
        throw new Error("Stripe has not finished loading yet.");
      }

      setProcessing(true)
      // Create a payment intent  on the backend || functions -----> payment/create?total=1000
      const response = await instance({
        method: "post",
        url: `/payment/create?total=${total * 100}`
     })
      const clientSecret = response.data?.clientSecret ?? response.data?.client_secret;

      if (!clientSecret) {
        throw new Error("Missing Stripe client secret from the backend.");
      }

      // client side conformation(react-side)
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret, {
        payment_method: {

          card: elements.getElement(CardElement)
        }
      }
      )

      if (error) {
        throw new Error(error.message || "Payment confirmation failed.");
      }

      if (!paymentIntent) {
        throw new Error("Stripe did not return a payment intent.");
      }

      await db
  .collection("users")
  .doc(user.uid)
  .collection("orders")
  .doc(paymentIntent.id)
  .set({
    basket: basket,
    amount: paymentIntent.amount,
    created: paymentIntent.created,
  });
      // empty the basket after payment
      dispatch({ type: Type.EMPTY_BASKET });
      setSuccess(true);
      // redirect to orders page after success
      setTimeout(() => {
        navigate("/orders", { replace: true });
      }, 2000);
    }
     catch (error) {
       setCardError(error?.message || "Payment failed. Please try again.");
    }
    finally {
      setProcessing(false);
    }
  }
    return (
      <LayOut>
        {/*header  */}
        <div className={classes.payment_header}>checkout({totalItems}) items
        </div>
        {/* payment method */}
        <section className={classes.payment}>
          {/* address */}
          <div className={classes.flex}>
            <h3>Delivery Address</h3>
            <div>
            <p>{user?.email}</p>
            <p>123 React Lane</p>
            <p>Los Angeles, CA</p>
            </div>
          </div>
          <hr />
           {/* product */}
          <div className={classes.flex}>
            <h3>Review items and delivery</h3>
            <div>
              {basket?.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
          <hr/>
           {/* card form */}
          <div className={classes.flex}>
            <h3>Payment Method</h3>
            <div className = {classes.payment_card_container}>
              <div className={classes.payment_details}>
                <form onSubmit={handlePayment}>
                  {/* Error */}
                  {
                    cardError && (
                      <small style={{ color: "red" }}>{cardError}</small>
                    )
                  }
                  {/* Success message */}
                  {
                    success && (
                      <div className={classes.success_msg}>
                        Payment Completed Successfully! Redirecting to your orders...
                      </div>
                    )
                  }
                  {/* card element */}
                  <CardElement onChange={handleChange} />
                  {/* price */}
                  <div className={classes.payment_price_container}>
                    <span>
                 Total order | <CurrencyFormat amount={total} />
                    </span>
                 </div>
                  <button disabled={processing || success}>
                    {
                      processing ? (
                        <div className={classes.loading}>
                          <ClipLoader size={15} color={"#fff"} />
                          <p>please wait...</p>
                        </div>
                      ) : success ? (
                        "Payment Success"
                      ) : (
                        "Pay Now"
                      )
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>
          <hr />
        </section>
        </LayOut> 
  
     
   
    
  )
}

export default Payment
