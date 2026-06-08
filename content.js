/**
 * YouTube CMS Video ID Linkifier Content Script
 * 
 * Replaces plain-text Video ID elements in YouTube CMS / Studio with clickable YouTube watch links
 * and appends a premium copy button next to them.
 */

// Keep track of observed shadow roots to prevent duplicate MutationObservers
const observedRoots = new WeakSet();

/**
 * Attaches a MutationObserver to a shadow root if not already observed.
 * @param {ShadowRoot} shadowRoot 
 */
function observeShadowRoot(shadowRoot) {
  if (observedRoots.has(shadowRoot)) return;
  observedRoots.add(shadowRoot);

  const observer = new MutationObserver(() => {
    scheduleProcess();
  });

  observer.observe(shadowRoot, {
    childList: true,
    subtree: true
  });
}

/**
 * Recursively searches for 'span.video-id' elements that haven't been processed yet,
 * traversing into all Shadow DOM boundaries.
 * @param {Document|ShadowRoot} root 
 * @returns {HTMLSpanElement[]}
 */
function findVideoIdSpans(root = document) {
  const results = [];

  // Find unprocessed video ID spans in the current root context
  const matches = root.querySelectorAll('span.video-id:not([data-ytcms-linkified])');
  for (let i = 0; i < matches.length; i++) {
    results.push(matches[i]);
  }

  // Find all elements to discover and traverse shadow roots recursively
  const allElements = root.querySelectorAll('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    if (el.shadowRoot) {
      observeShadowRoot(el.shadowRoot);
      results.push(...findVideoIdSpans(el.shadowRoot));
    }
  }

  return results;
}

/**
 * Processes all newly discovered Video ID spans.
 */
function processVideoIds() {
  const spans = findVideoIdSpans();
  if (spans.length === 0) return;

  spans.forEach((span) => {
    const videoId = span.textContent.trim();
    
    // YouTube Video IDs are exactly 11 characters (alphanumeric, dash, underscore)
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdRegex.test(videoId)) {
      return; // Skip if it doesn't look like a valid YouTube video ID
    }

    // Mark as processed immediately to prevent re-processing
    span.setAttribute('data-ytcms-linkified', 'true');

    // Create the full watch link
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const anchor = document.createElement('a');
    anchor.href = watchUrl;
    anchor.target = '_blank';
    anchor.className = 'ytcms-linkifier-link';
    anchor.textContent = watchUrl;

    // Clear span text and append the new link
    span.textContent = '';
    span.appendChild(anchor);

    // Create the copy button element
    const copyBtn = document.createElement('button');
    copyBtn.className = 'ytcms-linkifier-copy-btn';
    copyBtn.title = 'Copy watch link';
    copyBtn.setAttribute('aria-label', 'Copy watch link');
    
    // SVG and Tooltip content
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      <span class="ytcms-linkifier-tooltip">Copied!</span>
    `;

    // Handle copying to clipboard with interactive feedback
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await navigator.clipboard.writeText(watchUrl);

        // Visual feedback class
        copyBtn.classList.add('copied');

        // Swap copy icon to a checkmark
        const svgPath = copyBtn.querySelector('path');
        const copyPath = 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z';
        const checkmarkPath = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
        svgPath.setAttribute('d', checkmarkPath);

        // Show tooltip
        const tooltip = copyBtn.querySelector('.ytcms-linkifier-tooltip');
        tooltip.classList.add('show');

        // Restore original state after a short delay
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          svgPath.setAttribute('d', copyPath);
          tooltip.classList.remove('show');
        }, 1500);
      } catch (err) {
        console.error('[YouTube CMS Linkifier] Failed to copy URL to clipboard:', err);
      }
    });

    // Append the copy button directly after the span containing the link
    span.after(copyBtn);
  });
}

// Debounce processing using requestAnimationFrame to prevent main thread blocking
let frameRequested = false;

function scheduleProcess() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(() => {
    processVideoIds();
    frameRequested = false;
  });
}

// Perform initial DOM scan
scheduleProcess();

// Monitor light DOM mutations for dynamic page content loading
const observer = new MutationObserver(() => {
  scheduleProcess();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
