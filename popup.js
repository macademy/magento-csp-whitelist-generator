let scannedPages = {
    homePage: false,
    categoryPage: false,
    productPage: false,
    cartPage: false,
    checkoutPage: false
};

let currentTabId = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
});

function initializeUI() {
    const scanButton = document.getElementById('scanButton');
    const generateButton = document.getElementById('generateButton');
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        currentTabId = tabs[0].id;
        loadSavedState();
    });

    scanButton.addEventListener('click', handleScan);
    generateButton.addEventListener('click', handleGenerate);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

function handleScan() {
    const scanButton = document.getElementById('scanButton');
    const scanStatusDiv = document.getElementById('scanStatus');
    const statusDiv = document.getElementById('status');

    scanButton.disabled = true;
    scanStatusDiv.textContent = '⏳';
    statusDiv.textContent = 'Scanning current page...';

    chrome.runtime.sendMessage({action: "scanPage"}, (response) => {
        if (response && response.success) {
            console.log('Scan initiated successfully');
        } else {
            console.error('Failed to initiate scan', response);
            scanButton.disabled = false;
            scanStatusDiv.textContent = '🙃';
            statusDiv.innerHTML = '<strong>Scan failed to start.</strong> Please try again.';
        }
    });
}

function handleGenerate() {
    const generateButton = document.getElementById('generateButton');
    const scanStatusDiv = document.getElementById('scanStatus');
    const statusDiv = document.getElementById('status');

    generateButton.disabled = true;
    scanStatusDiv.textContent = '⏳';
    statusDiv.textContent = 'Generating CSP whitelist...';

    chrome.runtime.sendMessage({action: "generateCSP"}, (response) => {
        if (!response.success) {
            console.error('CSP whitelist unable to be generated.', response);
            generateButton.disabled = false;
            scanStatusDiv.textContent = '🙃';
            statusDiv.innerHTML = '<strong>CSP whitelist unable to be generated.</strong> Please try again.';
        }
    });
}

function handleCheckboxChange() {
    scannedPages[this.id] = this.checked;
    saveState();
    updateGenerateButtonState();
}

function loadSavedState() {
    chrome.storage.session.get([`scannedPages_${currentTabId}`], (result) => {
        if (result[`scannedPages_${currentTabId}`]) {
            scannedPages = result[`scannedPages_${currentTabId}`];
            updateCheckboxes();
        }
        updateGenerateButtonState();
    });
}

function updateCheckboxes() {
    for (const [page, scanned] of Object.entries(scannedPages)) {
        document.getElementById(page).checked = scanned;
    }
}

function updateGenerateButtonState() {
    const generateButton = document.getElementById('generateButton');
    const allPagesScanned = Object.values(scannedPages).every(Boolean);
    generateButton.disabled = !allPagesScanned;
}

function saveState() {
    chrome.storage.session.set({[`scannedPages_${currentTabId}`]: scannedPages}, () => {
        console.log('Scanned pages state saved for tab', currentTabId);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanComplete") {
        const scanButton = document.getElementById('scanButton');
        const scanStatusDiv = document.getElementById('scanStatus');
        const statusDiv = document.getElementById('status');

        scanButton.disabled = false;
        scanStatusDiv.textContent = '✅';
        statusDiv.innerHTML = '<strong>Scan complete!</strong> Check it off above, then scan another page.';
    } else if (message.action === "xmlGenerated") {
        downloadXML(message.xml);
        const generateButton = document.getElementById('generateButton');
        const scanStatusDiv = document.getElementById('scanStatus');
        const statusDiv = document.getElementById('status');

        generateButton.disabled = false;
        scanStatusDiv.textContent = '🎉';
        statusDiv.innerHTML = 'CSP whitelist generated and downloaded! <strong>Enjoy.</strong>';
    }
});

function downloadXML(xmlContent) {
    const blob = new Blob([xmlContent], {type: 'text/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csp_whitelist.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
