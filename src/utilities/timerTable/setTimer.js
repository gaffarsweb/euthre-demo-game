function getTimePlus30Seconds() {
    const currentTime = new Date();
    currentTime.setSeconds(currentTime.getSeconds() + 30); // Add 30 seconds
    return currentTime.toISOString(); // Return in ISO format
}

function isCurrentTimeGreaterThan(isoTimeString) {
    const currentTime = new Date();
    const targetTime = new Date(isoTimeString); // Parse the ISO time string
    return currentTime >= targetTime;
}

// Example usage
// const timePlus30 = getTimePlus30Seconds();
// console.log("Time Plus 30 Seconds:", timePlus30);

// const comparisonResult = isCurrentTimeGreaterThan(timePlus30);
// console.log("Is current time greater than time plus 30 seconds?", comparisonResult);


module.exports = { getTimePlus30Seconds, isCurrentTimeGreaterThan }