/* Constants */
const LOYALTY_PATTERN = 'https://akamai-gw.dbaas.aircanada.com/loyalty/*';
const CURRENCY_URL = 'https://akamai-gw.dbaas.aircanada.com/loyalty/currency';

const LISTENER_FILTER = {
    urls: [LOYALTY_PATTERN]
};

/* Globals */
let activeTabId;

/* Functions */
function requestListener(details) {
    console.debug('Before request:', details);

    if (details.url.startsWith(CURRENCY_URL)) {
        const filter = browser.webRequest.filterResponseData(details.requestId);

        let dataString = '';

        filter.ondata = (event) => {
            console.debug(`filter.ondata received ${event.data.byteLength} bytes`);
            filter.write(event.data);

            const decoded = new TextDecoder().decode(event.data);
            dataString += decoded;
        };

        filter.onstop = (event) => {
            filter.close();

            if (dataString && dataString.length > 0) {
                const currencyInfo = JSON.parse(dataString);
                console.debug(currencyInfo);
                const pointDetails = currencyInfo.pointDetails;
                const currencyMap = {};
                pointDetails.forEach((item) => {
                    currencyMap[item.pointType] = item.points;
                });

                if (activeTabId !== undefined) {
                    browser.tabs.sendMessage(activeTabId,{
                        type: 'points_data',
                        payload: currencyMap
                    });
                }
            }
        };
    }
}

function messageListener(message, sender) {
    console.debug('message received', message);
    if (message.type === 'register_tab') {
        activeTabId = sender.tab.id;
    }
}

function handleTabRemove(tabId) {
    if (activeTabId === tabId) {
        activeTabId = undefined;
    }
}

/* Main */
console.log('Running BWfA background script');
browser.webRequest.onBeforeRequest.addListener(requestListener, LISTENER_FILTER, ["blocking"]);
browser.runtime.onMessage.addListener(messageListener);
browser.tabs.onRemoved.addListener(handleTabRemove);