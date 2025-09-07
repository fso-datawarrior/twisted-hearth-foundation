/**
 * Cursor Chat Integration for Stagewise
 * 
 * This file provides a more direct integration with Cursor's chat system
 * by using the clipboard and providing clear instructions.
 */

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
 * Send component info to Cursor chat with better integration
 */
export function sendToCursorChat(componentInfo: ComponentInfo) {
  const formattedMessage = formatComponentForCursorChat(componentInfo);
  
  // Copy to clipboard
  navigator.clipboard.writeText(formattedMessage).then(() => {
    console.log('🎃 Component info copied to clipboard for Cursor chat');
    
    // Show a notification with instructions
    showCursorChatNotification();
    
    // Also try to open Cursor chat if possible
    tryOpenCursorChat();
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err);
    showErrorNotification('Failed to copy component info to clipboard');
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

/**
 * Show notification with Cursor chat instructions
 */
function showCursorChatNotification() {
  // Remove existing notification
  const existing = document.querySelector('[data-cursor-chat-notification]');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.setAttribute('data-cursor-chat-notification', 'true');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
    color: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
    z-index: 10000;
    max-width: 400px;
    font-family: 'Fira Code', monospace;
    animation: slideInFromRight 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <div style="font-size: 24px; margin-right: 10px;">🎃</div>
      <div>
        <div style="font-weight: bold; font-size: 16px;">Component Info Ready!</div>
        <div style="font-size: 12px; opacity: 0.9;">Copied to clipboard</div>
      </div>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="font-weight: bold; margin-bottom: 8px;">To use in Cursor chat:</div>
      <div style="font-size: 12px; line-height: 1.4;">
        1. Press <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">Ctrl+L</kbd> to open Cursor chat<br>
        2. Press <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">Ctrl+V</kbd> to paste<br>
        3. Ask questions about the component
      </div>
    </div>
    
    <div style="display: flex; gap: 10px;">
      <button id="open-cursor-chat" style="
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        flex: 1;
      ">Open Cursor Chat</button>
      
      <button id="close-notification" style="
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      ">Close</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Add event listeners
  notification.querySelector('#open-cursor-chat')?.addEventListener('click', () => {
    tryOpenCursorChat();
    notification.remove();
  });
  
  notification.querySelector('#close-notification')?.addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

/**
 * Try to open Cursor chat
 */
function tryOpenCursorChat() {
  // Try different methods to open Cursor chat
  
  // Method 1: Try to send a message to Cursor
  if ((window as any).cursor) {
    try {
      (window as any).cursor.postMessage({
        command: 'openChat',
        data: 'Component info ready for analysis'
      });
      console.log('🎃 Attempted to open Cursor chat via webview API');
    } catch (error) {
      console.log('Cursor webview API not available');
    }
  }
  
  // Method 2: Try to focus on Cursor window
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({
        type: 'cursor-open-chat',
        data: 'Component info ready for analysis'
      }, '*');
      console.log('🎃 Attempted to open Cursor chat via postMessage');
    } catch (error) {
      console.log('PostMessage to parent failed');
    }
  }
  
  // Method 3: Show instructions
  showCursorInstructions();
}

/**
 * Show detailed instructions for using Cursor chat
 */
function showCursorInstructions() {
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
    z-index: 10001;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: #1a1a1a;
    color: white;
    padding: 40px;
    border-radius: 16px;
    border: 2px solid #3B82F6;
    max-width: 600px;
    text-align: center;
    font-family: 'Fira Code', monospace;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  `;
  
  content.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">🎃</div>
    <h2 style="color: #3B82F6; margin-bottom: 20px; font-size: 24px;">Component Info Ready for Cursor Chat!</h2>
    
    <div style="background: #2a2a2a; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: left;">
      <h3 style="color: #10B981; margin-bottom: 15px;">How to use in Cursor:</h3>
      <ol style="line-height: 1.6; margin: 0; padding-left: 20px;">
        <li><strong>Open Cursor Chat:</strong> Press <kbd style="background: #3B82F6; padding: 4px 8px; border-radius: 4px;">Ctrl+L</kbd> (Windows) or <kbd style="background: #3B82F6; padding: 4px 8px; border-radius: 4px;">Cmd+L</kbd> (Mac)</li>
        <li><strong>Paste Component Info:</strong> Press <kbd style="background: #3B82F6; padding: 4px 8px; border-radius: 4px;">Ctrl+V</kbd> (Windows) or <kbd style="background: #3B82F6; padding: 4px 8px; border-radius: 4px;">Cmd+V</kbd> (Mac)</li>
        <li><strong>Ask Questions:</strong> Ask Cursor to analyze the component, suggest improvements, or explain its functionality</li>
      </ol>
    </div>
    
    <div style="background: #2a2a2a; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: left;">
      <h3 style="color: #F59E0B; margin-bottom: 15px;">Example questions you can ask:</h3>
      <ul style="line-height: 1.6; margin: 0; padding-left: 20px; color: #ccc;">
        <li>"What does this component do?"</li>
        <li>"How can I improve this component's styling?"</li>
        <li>"What are the accessibility issues with this component?"</li>
        <li>"How can I make this component more responsive?"</li>
        <li>"What's the best way to refactor this component?"</li>
      </ul>
    </div>
    
    <button id="close-instructions" style="
      background: #3B82F6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    ">Got it! Let's go to Cursor</button>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Close modal on button click
  content.querySelector('#close-instructions')?.addEventListener('click', () => {
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
 * Show error notification
 */
function showErrorNotification(message: string) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #EF4444;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  `;
  
  notification.textContent = `❌ ${message}`;
  document.body.appendChild(notification);
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
