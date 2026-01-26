/**
 * OmniContext Web Satellite - Content Script
 * Extracts page content and sends to Cortex Brain
 */

// Configuration
const CORTEX_URL = 'http://localhost:8000';

/**
 * Extract main text content from the page
 */
function extractPageContent() {
    // Get page metadata
    const title = document.title || '';
    const url = window.location.href;
    const hostname = window.location.hostname;

    // Try to find main content
    let mainContent = '';

    // Priority: article, main, then body
    const articleEl = document.querySelector('article');
    const mainEl = document.querySelector('main');
    const contentEl = document.querySelector('.content, #content, .post, .article');

    if (articleEl) {
        mainContent = articleEl.innerText;
    } else if (mainEl) {
        mainContent = mainEl.innerText;
    } else if (contentEl) {
        mainContent = contentEl.innerText;
    } else {
        // Fallback: get body text but limit size
        mainContent = document.body.innerText;
    }

    // Clean and truncate content
    mainContent = mainContent
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim()
        .substring(0, 5000);   // Limit to 5000 chars

    // Extract meta description if available
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = metaDesc ? metaDesc.getAttribute('content') : '';

    return {
        title,
        url,
        hostname,
        description,
        content: mainContent,
        timestamp: Date.now() / 1000
    };
}

/**
 * Send page context to Cortex
 */
async function sendToCortex(pageData) {
    const payload = {
        type: 'web_context',
        source: 'satellite-web',
        timestamp: pageData.timestamp,
        payload: {
            title: pageData.title,
            url: pageData.url,
            content_summary: pageData.description || pageData.content.substring(0, 500)
        }
    };

    try {
        const response = await fetch(`${CORTEX_URL}/api/context/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: pageData.url,
                content: `Title: ${pageData.title}\nURL: ${pageData.url}\n\n${pageData.content}`,
                type: 'web'
            })
        });

        if (response.ok) {
            console.log('[OmniContext] Page context sent to Cortex');
            return true;
        } else {
            console.error('[OmniContext] Failed to send context:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('[OmniContext] Error sending to Cortex:', error);
        return false;
    }
}

/**
 * Listen for messages from popup/background
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureContext') {
        const pageData = extractPageContent();
        sendToCortex(pageData).then(success => {
            sendResponse({ success, pageData });
        });
        return true; // Keep channel open for async response
    }

    if (message.action === 'getPageInfo') {
        const pageData = extractPageContent();
        sendResponse({ pageData });
        return true;
    }
});

// Log that content script is loaded
console.log('[OmniContext] Web Satellite content script loaded');
