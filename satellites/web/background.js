/**
 * OmniContext Web Satellite - Background Service Worker
 * Manages extension state and WebSocket connection
 */

const CORTEX_WS_URL = 'ws://localhost:8000/ws/stream';
const CORTEX_HTTP_URL = 'http://localhost:8000';

let isConnected = false;

/**
 * Check Cortex connection status
 */
async function checkConnection() {
    try {
        const response = await fetch(`${CORTEX_HTTP_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        isConnected = response.ok;
    } catch (error) {
        isConnected = false;
    }

    // Update badge
    chrome.action.setBadgeText({ text: isConnected ? '' : '!' });
    chrome.action.setBadgeBackgroundColor({ color: isConnected ? '#4CAF50' : '#F44336' });

    return isConnected;
}

// Check connection periodically
setInterval(checkConnection, 10000);
checkConnection();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getStatus') {
        checkConnection().then(connected => {
            sendResponse({ connected });
        });
        return true;
    }

    if (message.action === 'captureCurrentTab') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'captureContext' }, (response) => {
                    sendResponse(response);
                });
            }
        });
        return true;
    }
});

// Log startup
console.log('[OmniContext] Background service worker started');
