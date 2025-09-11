import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Eye, MessageSquare, Copy, TestTube, X } from 'lucide-react';
import { sendToCursorChat } from '../lib/cursor-integration';

interface ComponentInfo {
  tagName: string;
  className: string;
  id: string;
  textContent: string;
  attributes: Record<string, string>;
  boundingRect: DOMRect;
  componentName?: string;
  props?: Record<string, any>;
}

export function StagewiseToolbar() {
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isInspectMode) {
      document.body.classList.add('stagewise-inspect-mode');
    } else {
      document.body.classList.remove('stagewise-inspect-mode');
    }

    return () => {
      document.body.classList.remove('stagewise-inspect-mode');
    };
  }, [isInspectMode]);

  const handleInspectToggle = () => {
    setIsInspectMode(!isInspectMode);
    if (isInspectMode) {
      setSelectedComponent(null);
      setShowOverlay(false);
    }
  };

  const handleComponentClick = (e: MouseEvent) => {
    if (!isInspectMode) return;

    // Prevent clicks on Stagewise overlay elements
    const target = e.target as HTMLElement;
    if (target.closest('[data-stagewise-component-info]') || 
        target.closest('[data-stagewise-toolbar]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const element = target;
    const rect = element.getBoundingClientRect();
    
    const componentInfo: ComponentInfo = {
      tagName: element.tagName.toLowerCase(),
      className: element.className || '',
      id: element.id || '',
      textContent: element.textContent?.substring(0, 100) || '',
      attributes: Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>),
      boundingRect: rect,
      componentName: element.getAttribute('data-component') || 
                   element.className.split(' ').find(cls => 
                     cls.includes('Component') || 
                     cls.includes('Page') || 
                     cls.includes('Card')
                   ) || 'Unknown'
    };

    setSelectedComponent(componentInfo);
    setShowOverlay(true);

    // Highlight the element
    element.style.outline = '2px solid #F59E0B';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';

    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.style.backgroundColor = '';
    }, 3000);
  };

  const showComponentInfo = (info: ComponentInfo) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-stagewise-component-info', 'true');
    overlay.style.cssText = `
      position: fixed;
      top: ${info.boundingRect.top + window.scrollY - 10}px;
      left: ${info.boundingRect.left + window.scrollX - 10}px;
      background: white;
      border: 2px solid #3B82F6;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 400px;
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.4;
    `;

    overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #1F2937; font-size: 14px; font-weight: 600;">Component Info</h3>
        <button id="close-overlay" style="background: none; border: none; cursor: pointer; font-size: 18px; color: #6B7280;">&times;</button>
      </div>
      <div style="margin-bottom: 12px;">
        <strong>Tag:</strong> ${info.tagName}<br/>
        <strong>Class:</strong> ${info.className || 'None'}<br/>
        <strong>ID:</strong> ${info.id || 'None'}<br/>
        <strong>Component:</strong> ${info.componentName}<br/>
        <strong>Text:</strong> ${info.textContent.substring(0, 50)}${info.textContent.length > 50 ? '...' : ''}
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="send-to-chat" style="
          background: #3B82F6; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Send to Chat
          </button>
        <button id="copy-info" style="
          background: #10B981; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          Copy Info
          </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Add event listeners
    const closeBtn = overlay.querySelector('#close-overlay');
    const sendToChatBtn = overlay.querySelector('#send-to-chat');
    const copyInfoBtn = overlay.querySelector('#copy-info');

    const cleanup = () => {
      document.body.removeChild(overlay);
    };

    closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      cleanup();
    });

    sendToChatBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      sendToCursorChat(info);
      cleanup();
    });

    copyInfoBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      copyToClipboard(info);
    });

    // Close on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (!overlay.contains(e.target as Node)) {
        cleanup();
        document.removeEventListener('click', handleOutsideClick);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  };

  const copyToClipboard = async (info: ComponentInfo) => {
    const formattedInfo = formatComponentInfo(info);
    
    console.log('🎃 Attempting to copy component info:', formattedInfo);
    
    // Check if we're on mobile (common mobile user agents)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('🎃 Mobile browser detected, showing manual copy modal');
      showTextModal(formattedInfo);
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        console.log('🎃 Using modern clipboard API');
        await navigator.clipboard.writeText(formattedInfo);
        console.log('🎃 Successfully copied to clipboard via modern API');
        return;
      }

      // Fallback to legacy method
      console.log('🎃 Using legacy clipboard method');
      const textArea = document.createElement('textarea');
      textArea.value = formattedInfo;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('🎃 Successfully copied to clipboard via legacy method');
      } else {
        console.log('🎃 Legacy copy failed, showing manual copy modal');
        showTextModal(formattedInfo);
      }
    } catch (error) {
      console.error('🎃 Clipboard copy failed:', error);
      showTextModal(formattedInfo);
    }
  };

  const showTextModal = (text: string) => {
    const modal = document.createElement('div');
    modal.setAttribute('data-stagewise-component-info', 'true');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 90%;
        max-height: 80%;
        overflow: auto;
        position: relative;
      ">
        <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 18px; font-weight: 600;">
          Copy Component Info
        </h3>
        <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
          ${isMobile ? 'Select all text below and copy it manually (mobile browsers have clipboard restrictions):' : 'Select all text below and copy it:'}
        </p>
        <textarea readonly style="
          width: 100%;
          height: 200px;
          padding: 12px;
          border: 1px solid #D1D5DB;
          border-radius: 4px;
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.4;
          resize: vertical;
        ">${text}</textarea>
        <div style="display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end;">
          <button id="close-modal" style="
            background: #6B7280; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-modal');
    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // Auto-select text
    const textarea = modal.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.select();
    }
  };

  const formatComponentInfo = (info: ComponentInfo): string => {
    return `🎃 Stagewise Component Info

Tag: ${info.tagName}
Class: ${info.className || 'None'}
ID: ${info.id || 'None'}
Component: ${info.componentName}
Text: ${info.textContent.substring(0, 100)}${info.textContent.length > 100 ? '...' : ''}

Attributes:
${Object.entries(info.attributes).map(([key, value]) => `  ${key}: ${value}`).join('\n')}

Position: (${Math.round(info.boundingRect.left)}, ${Math.round(info.boundingRect.top)})
Size: ${Math.round(info.boundingRect.width)} × ${Math.round(info.boundingRect.height)}

Generated by Stagewise Toolbar
`;
  };

  const testCopy = async () => {
    const testText = '🎃 Test copy from Stagewise Toolbar - this should appear in your clipboard!';
    console.log('🎃 Testing clipboard with:', testText);
    
    try {
      await navigator.clipboard.writeText(testText);
      console.log('🎃 Test copy successful!');
      alert('Test copy successful! Check your clipboard.');
    } catch (error) {
      console.error('🎃 Test copy failed:', error);
      alert('Test copy failed. Check console for details.');
    }
  };

  useEffect(() => {
    if (isInspectMode) {
      document.addEventListener('click', handleComponentClick, true);
      return () => {
        document.removeEventListener('click', handleComponentClick, true);
      };
    }
  }, [isInspectMode]);

  if (!isInspectMode && !showOverlay) {
    return (
      <div 
        data-stagewise-toolbar="true"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        <Button
          onClick={handleInspectToggle}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4 mr-2" />
          Inspect
        </Button>
        <Button
          onClick={testCopy}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-green-500 text-green-600 hover:bg-green-50"
        >
          <TestTube className="w-4 h-4 mr-2" />
          Test Copy
        </Button>
    </div>
  );
}

  return (
    <div 
      data-stagewise-toolbar="true"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}
    >
      <Button
        onClick={handleInspectToggle}
        size="sm"
        variant="outline"
        className="bg-white/90 backdrop-blur-sm border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <Eye className="w-4 h-4 mr-2" />
        {isInspectMode ? 'Stop Inspect' : 'Inspect'}
      </Button>
      <Button
        onClick={testCopy}
        size="sm"
        variant="outline"
        className="bg-white/90 backdrop-blur-sm border-green-500 text-green-600 hover:bg-green-50"
      >
        <TestTube className="w-4 h-4 mr-2" />
        Test Copy
      </Button>
    </div>
  );
}
