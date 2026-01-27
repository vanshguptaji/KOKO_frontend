import React from 'react';
import ReactDOM from 'react-dom/client';
import { Chatbot } from './components/Chatbot';

// SDK Initialization
class VetChatbotSDK {
  constructor() {
    this.container = null;
    this.root = null;
    this.config = {};
  }

  // Initialize the chatbot
  init(config = {}) {
    // Merge with window config if available
    const windowConfig = typeof window !== 'undefined' ? window.VetChatbotConfig || {} : {};
    this.config = { ...windowConfig, ...config };

    // Create container element
    this.container = document.createElement('div');
    this.container.id = 'vetbot-root';
    document.body.appendChild(this.container);

    // Render the chatbot
    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      <React.StrictMode>
        <Chatbot
          position={this.config.position}
          primaryColor={this.config.primaryColor}
          title={this.config.title}
          subtitle={this.config.subtitle}
        />
      </React.StrictMode>
    );

    return this;
  }

  // Destroy the chatbot
  destroy() {
    if (this.root) {
      this.root.unmount();
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.root = null;
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.root) {
      this.root.render(
        <React.StrictMode>
          <Chatbot
            position={this.config.position}
            primaryColor={this.config.primaryColor}
            title={this.config.title}
            subtitle={this.config.subtitle}
          />
        </React.StrictMode>
      );
    }
  }
}

// Create global instance
const vetChatbot = new VetChatbotSDK();

// Auto-initialize when script loads (for script tag integration)
if (typeof window !== 'undefined') {
  window.VetChatbot = vetChatbot;
  
  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      vetChatbot.init();
    });
  } else {
    vetChatbot.init();
  }
}

export default vetChatbot;
