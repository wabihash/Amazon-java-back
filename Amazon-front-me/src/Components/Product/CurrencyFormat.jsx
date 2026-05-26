import React from "react";
import numeral from "numeral";

function CurrencyFormat({ amount }) {
  // Ensure amount is a valid number
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formattedAmount = numeral(numericAmount).format("0,0.00");

  return <div>$ {formattedAmount}</div>;
}

export default CurrencyFormat;
