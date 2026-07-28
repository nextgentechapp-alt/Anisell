import { useState, useEffect, useRef } from 'react';
import styles from './ChatSupport.module.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

const FAQ_RESPONSES: Record<string, string> = {
  'Track Order': 'You can track your order from the Orders page.',
  'Return Policy': 'Returns accepted within 7 days of delivery.',
  'Shipping Info': 'Free shipping on orders above ₹499. Standard 5-7 days.',
  'Contact Human': 'Please email support@anisell.com or call 1800-123-4567.',
};

const FAQ_QUESTIONS = Object.keys(FAQ_RESPONSES);

const STORAGE_KEY = 'pv_chat_history';

const WELCOME_MSG: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: '👋 Hi! Welcome to Anisell support. How can I help you today?',
  timestamp: Date.now(),
};

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch { /* ignore */ }
  return [WELCOME_MSG];
}

function formatChatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

let msgCounter = 0;
function nextId() {
  msgCounter += 1;
  return `msg-${Date.now()}-${msgCounter}`;
}

export default function ChatSupport() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addBotMessage = (text: string, delay = 600) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: nextId(), role: 'bot', text, timestamp: Date.now() }]);
    }, delay);
  };

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { id: nextId(), role: 'user', text: trimmed, timestamp: Date.now() }]);
    setInput('');

    const matched = FAQ_QUESTIONS.find(q => trimmed.toLowerCase().includes(q.toLowerCase()));
    if (matched) {
      addBotMessage(FAQ_RESPONSES[matched]);
    } else {
      addBotMessage("I'm not sure about that. Try asking about Track Order, Return Policy, Shipping Info, or Contact Human.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const toggleChat = () => {
    const opening = !open;
    setOpen(opening);
    if (opening && messages.length === 1 && messages[0].id === 'welcome') {
      // already has welcome message
    }
  };

  return (
    <>
      <button className={styles.fab} onClick={toggleChat} aria-label="Chat support">
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.botAvatar}>🐾</div>
            <div className={styles.botInfo}>
              <div className={styles.botName}>Anisell Bot</div>
              <div className={styles.botStatus}>Online</div>
            </div>
            <div className={styles.headerBtns}>
              <button className={styles.headerBtn} onClick={() => setOpen(false)} title="Minimize">
                _
              </button>
              <button className={styles.headerBtn} onClick={() => setOpen(false)} title="Close">
                ✕
              </button>
            </div>
          </div>

          <div className={styles.messagesArea}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot}`}
              >
                <div
                  className={`${styles.messageBubble} ${msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot}`}
                >
                  {msg.text}
                  {msg.role === 'bot' && msg.id === (messages.find(m => m.role === 'bot')?.id || '') && (
                    <div className={styles.quickReplies}>
                      {FAQ_QUESTIONS.map(q => (
                        <button
                          key={q}
                          className={styles.quickReplyBtn}
                          onClick={() => handleSend(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className={styles.messageTime}>{formatChatTime(msg.timestamp)}</span>
              </div>
            ))}

            {typing && (
              <div className={styles.typingIndicator}>
                <span>Bot is typing</span>
                <div className={styles.typingDots}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              className={styles.inputField}
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.sendBtn}
              disabled={!input.trim()}
              onClick={() => handleSend(input)}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
