import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { askCertifyChainAI } from '../../utils/ai';

export const AIAssistantView: React.FC = () => {
  const { certs } = useApp();

  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string }>>([
    {
      id: 'init-1',
      role: 'assistant',
      text: `Hello! I'm CertifyChain AI, an expert assistant for decentralized certificate verification and blockchain fraud detection.
How can I assist you today? You can ask me to verify a certificate number, explain cryptographic hash chains, or evaluate fraud signatures.`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;

    const userMsgId = 'msg-' + Date.now();
    setInput('');
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);
    setLoading(true);

    const reply = await askCertifyChainAI(text, certs);
    setLoading(false);
    setMessages(prev => [
      ...prev,
      { id: 'reply-' + Date.now(), role: 'assistant', text: reply },
    ]);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'cleared-1',
        role: 'assistant',
        text: 'Chat history cleared. How can I assist you with certificate verification today?',
      },
    ]);
  };

  const chips = [
    'Verify CERT-2024-001234',
    'How does hash chaining work?',
    'Check fraud indicators in certificate',
    'Explain SHA-256 verification',
  ];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Suggestion Chips */}
      <div className="suggestion-chips">
        <span>Suggested:</span>
        {chips.map(chip => (
          <button
            key={chip}
            className="chip"
            onClick={() => handleSend(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* AI Chat Card */}
      <div className="ai-chat-card">
        <div className="ai-chat-header">
          <div className="ai-avatar">
            <i className="ti ti-robot"></i>
          </div>
          <div style={{ flex: 1 }}>
            <strong>CertifyChain AI Assistant</strong>
            <p>Active · Blockchain &amp; Credential Fraud Analyst</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>
            <i className="ti ti-trash"></i> Clear Chat
          </button>
        </div>

        <div className="ai-messages">
          {messages.map(m => (
            <div key={m.id} className={`chat-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="msg-from">
                {m.role === 'assistant' ? (
                  <>
                    <i className="ti ti-robot"></i> CertifyChain AI
                  </>
                ) : (
                  'You'
                )}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg assistant">
              <div className="msg-from">
                <i className="ti ti-robot"></i> CertifyChain AI
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-area">
          <textarea
            className="ai-textarea"
            rows={2}
            placeholder="Ask anything about certificate verification, blockchain hashing, or fraud analysis..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="ai-input-actions">
            <span className="input-hint">Press Enter to send, Shift + Enter for new line</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              <i className="ti ti-send"></i> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
