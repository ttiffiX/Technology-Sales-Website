import React, {useState, useEffect} from 'react';

function CurrentDateTime() {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Update the date if necessary (for static use, this is optional)
        const intervalId = setInterval(() => {
            setCurrentDate(new Date());
        }, 86400000); // Update every 24 hours (24h * 60m * 60s * 1000ms)

        return () => clearInterval(intervalId); // Clean up on component unmount
    }, []);

    // Extract day, month, and year
    const day = currentDate.getDate(); // Get day of the month
    const month = currentDate.getMonth() + 1; // Get month (0-11, so add 1)
    const year = currentDate.getFullYear(); // Get the full year


    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Format the date as day/month/year
    const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`;
    return (
        <div>
            <span className={"date"}>{formattedDate}</span>
        </div>
    );
}

export default CurrentDateTime;
