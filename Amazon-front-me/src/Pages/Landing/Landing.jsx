import React from 'react'
import Carousel from '../../Components/Carousel/CarouselEffect'
import Category from '../../Components/Catagory/Category'
import Product from '../../Components/Product/Product'
import LayOut from '../../Components/LayOut/LayOut'
import CountdownTimer from '../../Components/CountdownTimer/CountdownTimer'

function Landing(){
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
        <LayOut>
            <Carousel />
            <Category />
            <CountdownTimer targetDate={tomorrow} />
            <Product/>
      </LayOut>
    )
}
export default Landing