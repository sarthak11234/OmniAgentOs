/**
 * OmniContext Web Satellite - Popup Script
 */

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const pageTitle = document.getElementById('pageTitle');
const pageUrl = document.getElementById('pageUrl');
const captureBtn = document.getElementById('captureBtn');
const resultDiv = document.getElementById('result');

/**
 * Check Cortex connection status
 */
async function checkStatus() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
        if (response.connected) {
            statusDot.classList.add('online');
            statusText.textContent = 'Connected to Cortex';
            captureBtn.disabled = false;
        } else {
            statusDot.classList.remove('online');
            statusText.textContent = 'Cortex Offline';
            captureBtn.disabled = true;
        }
    } catch (error) {
        statusDot.classList.remove('online');
        statusText.textContent = 'Extension Error';
        captureBtn.disabled = true;
    }
}

/**
 * Get current page info
 */
async function getPageInfo() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            pageTitle.textContent = tab.title || 'Untitled';
            pageUrl.textContent = tab.url || '';
        }
    } catch (error) {
        pageTitle.textContent = 'Unable to access page';
        pageUrl.textContent = '';
    }
}

/**
 * Capture and send page context
 */
async function captureContext() {
    captureBtn.disabled = true;
    captureBtn.textContent = '⏳ Capturing...';
    resultDiv.className = 'result';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.id) {
            throw new Error('No active tab');
        }

        // Send message to content script
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'captureContext' });

        if (response && response.success) {
            resultDiv.textContent = '✅ Context sent to Cortex!';
            resultDiv.className = 'result success';
        } else {
            throw new Error('Failed to capture context');
        }
    } catch (error) {
        console.error('Capture error:', error);
        resultDiv.textContent = '❌ Failed: ' + error.message;
        resultDiv.className = 'result error';
    } finally {
        captureBtn.disabled = false;
        captureBtn.textContent = '📷 Capture Page Context';
    }
}

// Event Listeners
captureBtn.addEventListener('click', captureContext);

// Initialize
checkStatus();
getPageInfo();

// Refresh status periodically while popup is open
setInterval(checkStatus, 5000);
