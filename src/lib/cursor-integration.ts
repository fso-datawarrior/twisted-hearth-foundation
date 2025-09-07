/**
 * Cursor Integration for Stagewise
 * 
 * This file handles communication between the Stagewise toolbar
 * and Cursor's chat interface for component analysis.
 */

export interface CursorMessage {
  type: 'stagewise-component-info';
  data: string;
  source: 'stagewise-toolbar';
}

export interface ComponentInfo {
  tagName: string;
  className: string;
  id: string;
  textContent: string;
  boundingRect: DOMRect;
  attributes: string[];
  computedStyles: CSSStyleDeclaration;
}

/**
 * Listen for messages from the Stagewise toolbar
 */
export function setupCursorIntegration() {
  // Listen for messages from the Stagewise toolbar
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'stagewise-component-info') {
      handleComponentInfoMessage(event.data);
    }
  });

  // Also listen for postMessage from iframe context
  window.addEventListener('message', (event) => {
    if (event.data && event.data.source === 'stagewise-toolbar') {
      handleComponentInfoMessage(event.data);
    }
  });
}

/**
 * Handle component info messages from Stagewise toolbar
 */
function handleComponentInfoMessage(message: CursorMessage) {
  console.log('🎃 Received component info from Stagewise:', message.data);
  
  // Try to send to Cursor chat if available
  if ((window as any).cursor) {
    // Cursor webview context
    (window as any).cursor.postMessage({
      command: 'stagewise.componentInfo',
      data: message.data
    });
  } else if (window.parent && window.parent !== window) {
    // Iframe context - try to send to parent
    window.parent.postMessage({
      type: 'stagewise-component-info',
      data: message.data,
      source: 'stagewise-webview'
    }, '*');
  } else {
    // Fallback: show in console and copy to clipboard
    console.log('🎃 Component info for Cursor chat:', message.data);
    
    // Copy to clipboard as fallback
    navigator.clipboard.writeText(message.data).then(() => {
      console.log('🎃 Component info copied to clipboard for Cursor chat');
    }).catch(err => {
      console.error('Failed to copy component info to clipboard:', err);
    });
  }
}

/**
 * Send component info directly to Cursor chat
 */
export function sendToCursorChat(componentInfo: ComponentInfo) {
  const formattedMessage = formatComponentForCursorChat(componentInfo);
  
  // Try to send to Cursor using various methods
  let sent = false;
  
  // Method 1: Try Cursor's webview API
  if ((window as any).cursor) {
    try {
      (window as any).cursor.postMessage({
        command: 'stagewise.componentInfo',
        data: formattedMessage
      });
      sent = true;
      console.log('🎃 Component info sent via Cursor webview API');
    } catch (error) {
      console.log('Cursor webview API not available:', error);
    }
  }
  
  // Method 2: Try Cursor's global API
  if (!sent && (window as any).cursorChat) {
    try {
      (window as any).cursorChat.sendMessage(formattedMessage);
      sent = true;
      console.log('🎃 Component info sent via Cursor global API');
    } catch (error) {
      console.log('Cursor global API not available:', error);
    }
  }
  
  // Method 3: Try postMessage to parent (if in iframe)
  if (!sent && window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({
        type: 'stagewise-component-info',
        data: formattedMessage,
        source: 'stagewise-webview'
      }, '*');
      sent = true;
      console.log('🎃 Component info sent via postMessage to parent');
    } catch (error) {
      console.log('PostMessage to parent failed:', error);
    }
  }
  
  // Method 4: Try Cursor's extension API
  if (!sent && (window as any).cursorExtension) {
    try {
      (window as any).cursorExtension.sendToChat(formattedMessage);
      sent = true;
      console.log('🎃 Component info sent via Cursor extension API');
    } catch (error) {
      console.log('Cursor extension API not available:', error);
    }
  }
  
  // Method 5: Fallback - copy to clipboard and show instructions
  if (!sent) {
    navigator.clipboard.writeText(formattedMessage).then(() => {
      console.log('🎃 Component info copied to clipboard - paste in Cursor chat');
      showCursorInstructions();
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }
}

/**
 * Show instructions for using with Cursor chat
 */
function showCursorInstructions() {
  // Create a modal with instructions
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: #1a1a1a;
    color: white;
    padding: 30px;
    border-radius: 12px;
    border: 2px solid #3B82F6;
    max-width: 500px;
    text-align: center;
    font-family: 'Fira Code', monospace;
  `;
  
  content.innerHTML = `
    <h2 style="color: #3B82F6; margin-bottom: 20px;">🎃 Component Info Ready!</h2>
    <p style="margin-bottom: 15px;">The component information has been copied to your clipboard.</p>
    <p style="margin-bottom: 20px;">To use it in Cursor chat:</p>
    <ol style="text-align: left; margin-bottom: 20px;">
      <li>Open Cursor's chat panel (Ctrl+L or Cmd+L)</li>
      <li>Paste the component info (Ctrl+V or Cmd+V)</li>
      <li>Ask questions about the component</li>
    </ol>
    <button id="close-modal" style="
      background: #3B82F6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    ">Got it!</button>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Close modal on button click
  content.querySelector('#close-modal')?.addEventListener('click', () => {
    modal.remove();
  });
  
  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Format component info for Cursor chat
 */
function formatComponentForCursorChat(info: ComponentInfo): string {
  const timestamp = new Date().toLocaleTimeString();
  
  return `🎃 **Stagewise Component Analysis** (${timestamp})

**Component Details:**
- **Tag:** \`${info.tagName}\`
- **Classes:** \`${info.className || 'none'}\`
- **ID:** \`${info.id || 'none'}\`
- **Text Content:** "${info.textContent || 'none'}"
- **Position:** (${Math.round(info.boundingRect.x)}, ${Math.round(info.boundingRect.y)})
- **Size:** ${Math.round(info.boundingRect.width)} × ${Math.round(info.boundingRect.height)}px

**Attributes:**
${info.attributes.length > 0 ? info.attributes.map(attr => `- ${attr}`).join('\n') : '- None'}

**Request:** Please help me understand this component and suggest improvements or modifications.`;
}

// Initialize Cursor integration when module loads
if (typeof window !== 'undefined') {
  setupCursorIntegration();
}