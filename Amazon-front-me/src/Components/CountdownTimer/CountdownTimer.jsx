import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        timerComponents.push(
            <span key={interval} className="timer__segment">
                {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]} 
                <span className="timer__label">{interval[0].toUpperCase()}</span>
            </span>
        );
    });

    return (
        <div className="countdown__timer">
            <span className="timer__text">Flash Sale Ends In:</span>
            <div className="timer__display">
                {timerComponents.length ? timerComponents : <span>Ends Soon!</span>}
            </div>
        </div>
    );
};

export default CountdownTimer;
