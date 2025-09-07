/**
 * Stagewise Toolbar Component for Twisted Halloween
 * 
 * This component provides a development toolbar for the staging environment
 * that integrates with Stagewise for enhanced debugging and collaboration.
 */

import { useEffect, useState } from 'react';
import { stagewiseConfig, initializeStagewise, isStagewiseEnabled, getCurrentEnvironment } from '@/lib/stagewise';
import { sendToCursorChat } from '@/lib/cursor-chat-integration';
import { setupCursorIntegration } from '@/lib/cursor-integration';

interface StagewiseToolbarProps {
  className?: string;
}

// Component click handler for inspection mode
function handleComponentClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  
  const target = event.target as HTMLElement;
  if (!target) return;
  
  // Ignore clicks on the Stagewise overlay itself
  if (target.closest('[data-stagewise-component-info]')) {
    console.log('🎃 Ignoring click on Stagewise overlay');
    return;
  }
  
  // Ignore clicks on the Stagewise toolbar
  if (target.closest('[data-stagewise-toolbar]')) {
    console.log('🎃 Ignoring click on Stagewise toolbar');
    return;
  }
  
  // Get component information
  const componentInfo = {
    tagName: target.tagName,
    className: target.className,
    id: target.id,
    textContent: target.textContent?.slice(0, 100) + (target.textContent && target.textContent.length > 100 ? '...' : ''),
    attributes: Array.from(target.attributes).map(attr => `${attr.name}="${attr.value}"`),
    boundingRect: target.getBoundingClientRect(),
    computedStyles: window.getComputedStyle(target),
  };
  
  console.log('🎃 Component Selected:', componentInfo);
  
  // Highlight the selected component
  target.style.outline = '3px solid #F59E0B';
  target.style.outlineOffset = '2px';
  target.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
  
  // Remove highlight after 2 seconds
  setTimeout(() => {
    target.style.outline = '';
    target.style.outlineOffset = '';
    target.style.backgroundColor = '';
  }, 2000);
  
  // Show component info in a temporary overlay
  showComponentInfo(componentInfo);
}

// Show component information overlay
function showComponentInfo(info: any) {
  // Remove existing overlay
  const existingOverlay = document.querySelector('[data-stagewise-component-info]');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create new overlay
  const overlay = document.createElement('div');
  overlay.setAttribute('data-stagewise-component-info', 'true');
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px;
    border-radius: 8px;
    border: 2px solid #F59E0B;
    font-family: 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.4;
    max-width: 500px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  `;
  
  // Format component info for chat
  const chatMessage = formatComponentForChat(info);
  
  overlay.innerHTML = `
    <div style="color: #F59E0B; font-weight: bold; margin-bottom: 10px;">🎃 Component Selected</div>
    <div><strong>Tag:</strong> ${info.tagName}</div>
    <div><strong>Class:</strong> ${info.className || 'none'}</div>
    <div><strong>ID:</strong> ${info.id || 'none'}</div>
    <div><strong>Text:</strong> ${info.textContent || 'none'}</div>
    <div><strong>Position:</strong> ${Math.round(info.boundingRect.x)}, ${Math.round(info.boundingRect.y)}</div>
    <div><strong>Size:</strong> ${Math.round(info.boundingRect.width)} × ${Math.round(info.boundingRect.height)}</div>
    
    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #444;">
      <button 
        id="send-to-chat-btn"
        style="
          background: #10B981; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 11px;
          margin-right: 8px;
        "
        title="Send component info to Cursor chat"
      >
        💬 Send to Chat
      </button>
      
      <button 
        id="copy-info-btn"
        style="
          background: #3B82F6; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 11px;
        "
        title="Copy component info to clipboard"
      >
        📋 Copy Info
      </button>
    </div>
    
    <div style="margin-top: 10px; color: #10B981; font-size: 10px;">Click anywhere to close</div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners for buttons
  const sendToChatBtn = overlay.querySelector('#send-to-chat-btn');
  const copyInfoBtn = overlay.querySelector('#copy-info-btn');
  
  sendToChatBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    console.log('🎃 Send to Chat button clicked');
    sendComponentToCursor(info);
  });
  
  copyInfoBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    console.log('🎃 Copy Info button clicked');
    copyToClipboard(chatMessage);
  });
  
  // Prevent right-click context menu on buttons
  copyInfoBtn?.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  sendToChatBtn?.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  // Close on click (but not on buttons)
  overlay.addEventListener('click', (e) => {
    // Don't close if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    overlay.remove();
  });
  
  // Auto-close after 10 seconds (increased for button interaction)
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
    }
  }, 10000);
}

// Format component information for chat
function formatComponentForChat(info: any): string {
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

// Send component info to VS Code chat
function sendToChat(message: string) {
  try {
    // Try to use VS Code's postMessage API if available
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'stagewise-component-info',
        data: message,
        source: 'stagewise-toolbar'
      }, '*');
      console.log('🎃 Component info sent to VS Code chat');
      
      // Show success message
      showNotification('✅ Component info sent to VS Code chat!', 'success');
    } else {
      // Fallback: copy to clipboard and show instructions
      copyToClipboard(message);
      showNotification('📋 Component info copied to clipboard. Paste it in Cursor chat.', 'info');
    }
  } catch (error) {
    console.error('Failed to send to chat:', error);
    // Fallback to clipboard
    copyToClipboard(message);
    showNotification('📋 Component info copied to clipboard. Paste it in Cursor chat.', 'info');
  }
}

// Send component info directly to Cursor chat using the integration
function sendComponentToCursor(info: any) {
  try {
    sendToCursorChat(info);
    // The new integration handles its own notifications
  } catch (error) {
    console.error('Failed to send to Cursor chat:', error);
    // Fallback to clipboard
    const message = formatComponentForChat(info);
    copyToClipboard(message);
    showNotification('📋 Component info copied to clipboard. Paste it in Cursor chat.', 'info');
  }
}

// Copy component info to clipboard
function copyToClipboard(text: string) {
  console.log('🎃 Attempting to copy to clipboard');
  console.log('🎃 Text length:', text.length);
  console.log('🎃 Text preview:', text.substring(0, 200) + '...');
  console.log('🎃 Clipboard API available:', !!navigator.clipboard);
  console.log('🎃 Secure context:', window.isSecureContext);
  console.log('🎃 User agent:', navigator.userAgent);
  
  // Check if this is a mobile browser
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log('🎃 Is mobile browser:', isMobile);
  
  // For mobile browsers, show modal immediately as clipboard often fails silently
  if (isMobile) {
    console.log('🎃 Mobile browser detected - showing manual copy modal');
    showNotification('📱 Mobile browser detected - showing manual copy option', 'info');
    showTextModal(text);
    return;
  }
  
  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    console.log('🎃 Using modern clipboard API');
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ Component info copied to clipboard via modern API');
      showNotification('📋 Component info copied to clipboard!', 'success');
    }).catch(err => {
      console.error('❌ Modern clipboard API failed:', err);
      // Fallback to legacy method
      fallbackCopyToClipboard(text);
    });
  } else {
    // Fallback to legacy method
    console.log('🎃 Using fallback clipboard method');
    fallbackCopyToClipboard(text);
  }
}

// Fallback copy method for older browsers or non-secure contexts
function fallbackCopyToClipboard(text: string) {
  console.log('🎃 Starting fallback copy method');
  try {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    
    console.log('🎃 Textarea created and added to DOM');
    
    // Select and copy
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
    
    console.log('🎃 Text selected, attempting copy...');
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    console.log('🎃 execCommand result:', successful);
    
    if (successful) {
      console.log('✅ Component info copied to clipboard via fallback method');
      showNotification('📋 Component info copied to clipboard!', 'success');
    } else {
      throw new Error('execCommand copy failed');
    }
  } catch (err) {
    console.error('❌ Fallback copy failed:', err);
    showNotification('❌ Failed to copy to clipboard. Please copy manually.', 'error');
    
    // Show the text in a modal as last resort
    showTextModal(text);
  }
}

// Show text in a modal as last resort
function showTextModal(text: string) {
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
    padding: 30px;
    border-radius: 12px;
    border: 2px solid #EF4444;
    max-width: 80%;
    max-height: 80%;
    font-family: 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.4;
  `;
  
  content.innerHTML = `
    <h3 style="color: #10B981; margin-bottom: 15px;">📱 Mobile Copy Helper</h3>
    <p style="margin-bottom: 15px; color: #ccc;">Mobile browsers often block clipboard access. Please select and copy the text below manually:</p>
    <div style="margin-bottom: 10px; padding: 10px; background: #2a2a2a; border-radius: 6px; font-size: 12px; color: #ccc;">
      <strong>Instructions:</strong><br>
      1. Tap and hold in the text area below<br>
      2. Select "Select All" or drag to select all text<br>
      3. Tap "Copy" from the context menu
    </div>
    <textarea readonly style="
      width: 100%;
      height: 300px;
      background: #2a2a2a;
      color: white;
      border: 1px solid #444;
      padding: 15px;
      border-radius: 6px;
      font-family: 'Fira Code', monospace;
      font-size: 11px;
      line-height: 1.4;
      resize: vertical;
      -webkit-user-select: text;
      user-select: text;
    ">${text}</textarea>
    <div style="margin-top: 15px; text-align: right;">
      <button id="close-text-modal" style="
        background: #3B82F6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
      ">Close</button>
    </div>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Auto-select the text
  const textarea = content.querySelector('textarea');
  if (textarea) {
    textarea.focus();
    textarea.select();
  }
  
  // Close modal
  content.querySelector('#close-text-modal')?.addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Show notification
function showNotification(message: string, type: 'success' | 'info' | 'error') {
  const notification = document.createElement('div');
  const colors = {
    success: '#10B981',
    info: '#3B82F6', 
    error: '#EF4444'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideInFromRight 0.3s ease-out;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

export default function StagewiseToolbar({ className = '' }: StagewiseToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [environment, setEnvironment] = useState<string>('');

  useEffect(() => {
    // Initialize Stagewise when component mounts
    initializeStagewise();
    
    // Initialize Cursor integration
    setupCursorIntegration();
    
    // Set environment
    setEnvironment(getCurrentEnvironment());
    
    // Show toolbar only in development/staging
    setIsVisible(isStagewiseEnabled());
  }, []);

  // Don't render in production
  if (!isVisible || environment === 'production') {
    return null;
  }

  return (
    <div 
      className={`fixed top-4 right-4 z-50 bg-black/90 text-white p-3 rounded-lg shadow-lg border border-gray-600 ${className}`}
      data-stagewise-toolbar="true"
    >
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-semibold">Stagewise</span>
        </div>
        
        <div className="text-gray-300">
          {environment}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('🎃 Stagewise Debug Panel Toggled');
              // Toggle debug panel visibility
              const debugPanel = document.querySelector('[data-stagewise-debug]');
              if (debugPanel) {
                debugPanel.classList.toggle('hidden');
              }
            }}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            title="Toggle Debug Panel"
          >
            Debug
          </button>
          
          <button
            onClick={async () => {
              console.log('🎃 Testing clipboard functionality');
              
              // Test both methods
              const testText = `Stagewise Test - ${new Date().toLocaleTimeString()}`;
              
              // Try modern API first
              if (navigator.clipboard && window.isSecureContext) {
                try {
                  await navigator.clipboard.writeText(testText);
                  console.log('✅ Modern clipboard API worked');
                  
                  // Try to read back to verify it actually worked
                  try {
                    const readBack = await navigator.clipboard.readText();
                    if (readBack === testText) {
                      console.log('✅ Clipboard verification: SUCCESS');
                      showNotification('✅ Clipboard working! Text copied and verified.', 'success');
                    } else {
                      console.log('⚠️ Clipboard verification: FAILED - different text');
                      showNotification('⚠️ Clipboard may not be working properly', 'error');
                    }
                  } catch (readError) {
                    console.log('⚠️ Cannot read clipboard to verify:', readError.message);
                    showNotification('⚠️ Clipboard write succeeded but cannot verify', 'error');
                  }
                } catch (err) {
                  console.error('❌ Modern clipboard API failed:', err);
                  showNotification('❌ Modern clipboard API failed', 'error');
                }
              } else {
                console.log('❌ Modern clipboard API not available');
                showNotification('❌ Modern clipboard API not available', 'error');
              }
              
              // Also test our function
              copyToClipboard(testText);
            }}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            title="Test Clipboard"
          >
            Test Copy
          </button>
          
          <button
            onClick={() => {
              console.log('🎃 Stagewise Component Inspector Toggled');
              // Toggle component inspector
              const isInspectMode = document.body.classList.toggle('stagewise-inspect-mode');
              
              if (isInspectMode) {
                // Add click listeners to all elements for component selection
                document.addEventListener('click', handleComponentClick, true);
                console.log('🎃 Component inspection mode enabled - click any element to inspect');
              } else {
                // Remove click listeners
                document.removeEventListener('click', handleComponentClick, true);
                console.log('🎃 Component inspection mode disabled');
              }
            }}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
            title="Toggle Component Inspector"
          >
            Inspect
          </button>
          
          <button
            onClick={() => {
              console.log('🎃 Stagewise Performance Monitor Toggled');
              // Toggle performance monitoring
              const perfMonitor = document.querySelector('[data-stagewise-performance]');
              if (perfMonitor) {
                perfMonitor.classList.toggle('hidden');
              }
            }}
            className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
            title="Toggle Performance Monitor"
          >
            Perf
          </button>
        </div>
      </div>
      
      {/* Debug Panel */}
      <div 
        data-stagewise-debug
        className="mt-3 p-3 bg-gray-800 rounded border-t border-gray-600 text-xs space-y-2"
      >
        <div>
          <strong>Environment:</strong> {environment}
        </div>
        <div>
          <strong>Features:</strong> {Object.entries(stagewiseConfig.features)
            .filter(([_, enabled]) => enabled)
            .map(([feature]) => feature)
            .join(', ')}
        </div>
        <div>
          <strong>Plugins:</strong> {stagewiseConfig.plugins
            .filter(plugin => plugin.enabled)
            .map(plugin => plugin.name)
            .join(', ')}
        </div>
        <div>
          <strong>URL:</strong> {window.location.href}
        </div>
      </div>
      
      {/* Performance Monitor */}
      <div 
        data-stagewise-performance
        className="mt-3 p-3 bg-gray-800 rounded border-t border-gray-600 text-xs space-y-2 hidden"
      >
        <div>
          <strong>Performance Metrics:</strong>
        </div>
        <div>
          <strong>Load Time:</strong> {performance.now().toFixed(2)}ms
        </div>
        <div>
          <strong>Memory:</strong> {(performance as any).memory?.usedJSHeapSize ? 
            `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 
            'N/A'
          }
        </div>
        <div>
          <strong>FPS:</strong> <span id="stagewise-fps">Calculating...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for using Stagewise features in components
 */
export function useStagewise() {
  const [isEnabled, setIsEnabled] = useState(isStagewiseEnabled());
  const [environment, setEnvironment] = useState(getCurrentEnvironment());

  useEffect(() => {
    setIsEnabled(isStagewiseEnabled());
    setEnvironment(getCurrentEnvironment());
  }, []);

  return {
    isEnabled,
    environment,
    config: stagewiseConfig,
  };
}
