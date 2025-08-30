// Chatbot Embed Script
// Add this script to any website to embed the chatbot

(function () {
  'use strict';

  // Configuration
  const config = {
    chatbotUrl: 'https://your-app.vercel.app/chat', // Replace with your deployed URL
    position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    closedSize: 80,
    openSize: 400,
    zIndex: 9999,
    primaryColor: '#101238',
    hoverColor: '#1a1f4a',
  };

  // Create iframe element
  function createChatbotIframe() {
    const iframe = document.createElement('iframe');
    iframe.src = config.chatbotUrl;
    iframe.width = config.closedSize;
    iframe.height = config.closedSize;
    iframe.frameBorder = '0';
    iframe.id = 'chatbot-iframe';
    iframe.style.cssText = `
      position: fixed;
      ${getPosition()};
      border: none;
      border-radius: 50%;
      z-index: ${config.zIndex};
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(16, 18, 56, 0.3);
      overflow: hidden;
      cursor: pointer;
    `;
    iframe.title = 'Chat Assistant';

    return iframe;
  }

  // Get position based on config
  function getPosition() {
    switch (config.position) {
      case 'bottom-left':
        return 'left: 20px; bottom: 20px;';
      case 'top-right':
        return 'right: 20px; top: 20px;';
      case 'top-left':
        return 'left: 20px; top: 20px;';
      default: // bottom-right
        return 'right: 20px; bottom: 20px;';
    }
  }

  // Resize iframe
  function resizeIframe(isOpen) {
    const iframe = document.getElementById('chatbot-iframe');
    if (iframe) {
      if (isOpen) {
        iframe.style.width = config.openSize + 'px';
        iframe.style.height = config.openSize + 'px';
        iframe.style.borderRadius = '10px';
        iframe.style.cursor = 'default';
      } else {
        iframe.style.width = config.closedSize + 'px';
        iframe.style.height = config.closedSize + 'px';
        iframe.style.borderRadius = '50%';
        iframe.style.cursor = 'pointer';
      }
    }
  }

  // Handle messages from iframe
  function handleIframeMessage(event) {
    if (event.data && event.data.type === 'CHAT_TOGGLE') {
      resizeIframe(event.data.isOpen);
    }
  }

  // Initialize chatbot
  function initChatbot() {
    // Check if already initialized
    if (document.getElementById('chatbot-iframe')) {
      return;
    }

    // Create and append iframe
    const iframe = createChatbotIframe();
    document.body.appendChild(iframe);

    // Listen for messages from iframe
    window.addEventListener('message', handleIframeMessage);

    // Add click handler for manual toggle (fallback)
    iframe.addEventListener('click', function () {
      // This will be handled by the iframe content
    });

    // Close when clicking outside (optional)
    document.addEventListener('click', function (event) {
      const iframe = document.getElementById('chatbot-iframe');
      if (iframe && !iframe.contains(event.target)) {
        // Send close message to iframe
        iframe.contentWindow.postMessage(
          {
            type: 'CLOSE_CHAT',
          },
          '*'
        );
      }
    });

    console.log('Chatbot initialized successfully!');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

  // Expose functions globally for manual control
  window.ChatbotEmbed = {
    init: initChatbot,
    resize: resizeIframe,
    config: config,
  };
})();
