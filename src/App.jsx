import { Chatbot } from './components/Chatbot';
import { MessageCircle, Calendar, Plug, Bot, ClipboardList, Database, Palette, Sparkles } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Demo Landing Page */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            AI-Powered Veterinary Assistant
          </div>
          <h1 className="hero-title">
            VetBot
            <span className="hero-title-accent">SDK</span>
          </h1>
          <p className="hero-subtitle">
            A plug-and-play chatbot for veterinary websites. Answer pet care questions
            and book appointments with AI-powered assistance.
          </p>
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon"><MessageCircle size={18} /></span>
              <span>AI Q&A</span>
            </div>
            <div className="feature">
              <span className="feature-icon"><Calendar size={18} /></span>
              <span>Book Appointments</span>
            </div>
            <div className="feature">
              <span className="feature-icon"><Plug size={18} /></span>
              <span>Easy Integration</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="section">
          <h2 className="section-title">How to Integrate</h2>
          <div className="code-example">
            <div className="code-header">
              <span className="code-dot"></span>
              <span className="code-dot"></span>
              <span className="code-dot"></span>
              <span className="code-title">Basic Integration</span>
            </div>
            <pre className="code-block">
              <code>{`<script src="https://your-domain.com/chatbot.js"></script>`}</code>
            </pre>
          </div>

          <div className="code-example">
            <div className="code-header">
              <span className="code-dot"></span>
              <span className="code-dot"></span>
              <span className="code-dot"></span>
              <span className="code-title">With Context Configuration</span>
            </div>
            <pre className="code-block">
              <code>{`<script>
  window.VetChatbotConfig = {
    userId: "user_123",
    userName: "John Doe",
    petName: "Buddy",
    source: "marketing-website"
  };
</script>
<script src="https://your-domain.com/chatbot.js"></script>`}</code>
            </pre>
          </div>
        </section>

        <section className="section section-alt">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon"><Bot size={40} strokeWidth={1.5} /></div>
              <h3>AI-Powered Responses</h3>
              <p>Uses Google Gemini API to provide accurate veterinary information</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon"><ClipboardList size={40} strokeWidth={1.5} /></div>
              <h3>Appointment Booking</h3>
              <p>Conversational flow to collect appointment details and book visits</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon"><Database size={40} strokeWidth={1.5} /></div>
              <h3>Conversation History</h3>
              <p>All conversations are stored for continuity and reference</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon"><Palette size={40} strokeWidth={1.5} /></div>
              <h3>Customizable</h3>
              <p>Configure colors, titles, and context via SDK options</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Try It Out</h2>
          <p className="section-description">
            Click the chat button in the bottom-right corner to interact with VetBot.
            Ask questions about pet care, vaccination, diet, or book an appointment!
          </p>
          <div className="try-suggestions">
            <p className="suggestions-label">Try asking:</p>
            <ul className="suggestions-list">
              <li>"What vaccines does my puppy need?"</li>
              <li>"How often should I feed my cat?"</li>
              <li>"My dog is scratching a lot, what should I do?"</li>
              <li>"I want to book an appointment"</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>2026 VetBot SDK. Built for KOKO Assignment.</p>
      </footer>

      {/* Chatbot Widget */}
      <Chatbot />
    </div>
  );
}

export default App;
