let accumulatedRequests = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanPage") {
        scanCurrentPage()
            .then(() => {
                sendResponse({success: true});
            })
            .catch(error => {
                console.error('Error scanning page:', error);
                sendResponse({success: false, error: error.message});
            });
    }

    if (request.action === "generateCSP") {
        if (accumulatedRequests.length === 0) {
            sendResponse({success: false, error: 'No requests captured'});
            return true; // Early exit
        }

        generateCSPWhitelist()
            .then(xml => {
                sendXMLToPopup(xml);
                sendResponse({success: true});
            })
            .catch(error => {
                console.error('Error generating CSP whitelist:', error);
                sendResponse({success: false, error: error.message});
            });
    }

    return true; // Asynchronous response to keep the message channel open
});

async function scanCurrentPage() {
    try {
        const tab = await getCurrentTab();
        await chrome.tabs.reload(tab.id);
        const requests = await captureRequests(tab.id);
        accumulatedRequests = [...accumulatedRequests, ...requests];
        console.log('Accumulated requests:', accumulatedRequests.length);
        chrome.runtime.sendMessage({action: "scanComplete"});
    } catch (error) {
        console.error('Error during page scan:', error);
        chrome.runtime.sendMessage({action: "scanError", error: error.message});
    }
}

async function captureRequests(tabId) {
    return new Promise((resolve) => {
        const requests = [];
        let lastRequestTime = Date.now();

        const listener = (details) => {
            if (details.tabId === tabId) {
                console.log('Request captured:', details.url, 'Type:', details.type);
                requests.push(details);
                lastRequestTime = Date.now();
            }
        };

        chrome.webRequest.onCompleted.addListener(listener, {urls: ["<all_urls>"], tabId: tabId}, ["responseHeaders"]);

        const timer = setInterval(() => {
            if (Date.now() - lastRequestTime > 2000) {
                completeCapture();
            }
        }, 500);

        const fallbackTimer = setTimeout(() => {
            console.log('Capture timed out. Total requests:', requests.length);
            completeCapture();
        }, 30000);

        const completeCapture = () => {
            chrome.webRequest.onCompleted.removeListener(listener);
            clearInterval(timer);
            clearTimeout(fallbackTimer);
            console.log('Capture complete. Total requests:', requests.length);
            resolve(requests);
        };
    });
}

async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    console.log('Current tab:', tab.url);
    return tab;
}

async function generateCSPWhitelist() {
    const cspWhitelist = processRequests(accumulatedRequests);
    return generateXML(cspWhitelist);
}

function processRequests(requests) {
    const cspWhitelist = {
        'default-src': new Set(),
        'script-src': new Set(),
        'style-src': new Set(),
        'img-src': new Set(),
        'font-src': new Set(),
        'connect-src': new Set(),
        'frame-src': new Set(),
        'object-src': new Set(),
        'media-src': new Set(),
    };

    const magentoDomain = new URL(requests[0].url).hostname;

    requests.forEach(request => {
        const url = new URL(request.url);
        const host = url.host;

        if (host === magentoDomain) {
            return;
        }

        console.log('Processing request:', request.url, 'Type:', request.type);

        switch (request.type) {
            case 'script':
                cspWhitelist['script-src'].add(host);
                break;
            case 'stylesheet':
                cspWhitelist['style-src'].add(host);
                break;
            case 'image':
                cspWhitelist['img-src'].add(host);
                break;
            case 'font':
                cspWhitelist['font-src'].add(host);
                break;
            case 'xmlhttprequest':
                cspWhitelist['connect-src'].add(host);
                break;
            case 'sub_frame':
                cspWhitelist['frame-src'].add(host);
                break;
            case 'object':
                cspWhitelist['object-src'].add(host);
                break;
            case 'media':
                cspWhitelist['media-src'].add(host);
                break;
            default:
                cspWhitelist['default-src'].add(host);
        }
    });

    console.log('Final CSP Whitelist:', cspWhitelist);

    return cspWhitelist;
}

function generateXML(cspWhitelist) {
    let xml = '<?xml version="1.0"?>\n';
    xml += '<csp_whitelist xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Csp:etc/csp_whitelist.xsd">\n';
    xml += '    <policies>\n';

    for (const [directive, hosts] of Object.entries(cspWhitelist)) {
        if (hosts.size > 0) {
            xml += `        <policy id="${directive}">\n`;
            xml += '            <values>\n';
            hosts.forEach(host => {
                xml += `                <value id="${host}" type="host">${host}</value>\n`;
            });
            xml += '            </values>\n';
            xml += '        </policy>\n';
        }
    }

    xml += '    </policies>\n';
    xml += '</csp_whitelist>\n';

    return xml;
}

function sendXMLToPopup(xml) {
    chrome.runtime.sendMessage({
        action: "xmlGenerated",
        xml: xml
    });
}
