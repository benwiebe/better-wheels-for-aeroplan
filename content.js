console.log('Running BWfA content script');

/* Main */
browser.runtime.sendMessage({
    type: 'register_tab'
});
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.debug('message received', message);
    if (message.type === 'points_data') {
        const pointsDetails = message.payload;

        console.log(pointsDetails);
        const matchingTags = document.getElementsByTagName('kilo-status-dials-cont');
        console.debug('matchingTags', matchingTags);
        if (matchingTags.length === 1) {
            const textElement = document.createElement('p');
            textElement.innerHTML = Object.keys(pointsDetails).reduce((acc, k) => {
                return `${acc}${k}: ${pointsDetails[k]}<br />`;

            }, '');
            matchingTags[0].appendChild(textElement);
        }
    }
})