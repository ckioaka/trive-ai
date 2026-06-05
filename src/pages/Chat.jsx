import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { sendMessageToMizzy } from "../services/mizzy";
import {
  saveConversationMessage, getConversationMessages,
  getConversations, createConversation, deleteConversation
} from "../firebase/firestore";
import { logoutUser } from "../firebase/auth";

export default function Chat({ toggleTheme, theme }) {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const name = userData?.displayName || user?.displayName || "Friend";

  const isLight = theme === "light";
  const topbarBg = isLight ? "rgba(252,232,243,0.95)" : "rgba(6,10,6,0.92)";
  const inputBg = isLight ? "rgba(252,232,243,0.95)" : "rgba(6,10,6,0.95)";
  const sendBtnGradient = isLight
    ? "linear-gradient(135deg, #e066a8, #c44d8a)"
    : "linear-gradient(135deg, #a8ff3e, #6db32a)";
  const sendBtnColor = isLight ? "#ffffff" : "#060a06";
  const userMsgBg = isLight
    ? "linear-gradient(135deg, #e066a8, #c44d8a)"
    : "linear-gradient(135deg, #a8ff3e, #6db32a)";
  const userMsgColor = isLight ? "#ffffff" : "#060a06";
  const avatarBg = isLight
    ? "linear-gradient(135deg, #e066a8, #c44d8a)"
    : "linear-gradient(135deg, #a8ff3e, #6db32a)";
  const avatarColor = isLight ? "#ffffff" : "#060a06";
  const dotColor = isLight ? "#c44d8a" : "#a8ff3e";

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadConversations = async () => {
    if (!user) return;
    const convs = await getConversations(user.uid);
    setConversations(convs);
    if (convs.length > 0 && !activeConvId) {
      loadConversation(convs[0].id);
    }
  };

  const loadConversation = async (convId) => {
    setLoadingMsgs(true);
    setActiveConvId(convId);
    setShowWelcome(false);
    setSidebarOpen(false);
    if (user) {
      const msgs = await getConversationMessages(user.uid, convId);
      setMessages(msgs);
    }
    setLoadingMsgs(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConvId(null);
    setShowWelcome(true);
    setSidebarOpen(false);
    setImageBase64(null);
    setImagePreview(null);
    inputRef.current?.focus();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Gambar maksimal 4MB ya!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result.split(",")[1];
      setImageBase64(base64);
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;
    const text = input.trim() || "Analisis gambar ini";
    setInput("");
    setShowWelcome(false);
    const currentImage = imageBase64;
    const currentPreview = imagePreview;
    setImageBase64(null);
    setImagePreview(null);

    let convId = activeConvId;
    if (!convId && user) {
      convId = await createConversation(user.uid, text.slice(0, 40));
      setActiveConvId(convId);
      loadConversations();
    }

    const userMsg = { role: "user", content: text, image: currentPreview, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (user && convId) await saveConversationMessage(user.uid, convId, { role: "user", content: text });

    setLoading(true);
    const reply = await sendMessageToMizzy(text, name, [...messages, userMsg], currentImage);
    const mizzyMsg = { role: "mizzy", content: reply, timestamp: new Date() };
    setMessages(prev => [...prev, mizzyMsg]);
    if (user && convId) {
      await saveConversationMessage(user.uid, convId, mizzyMsg);
      loadConversations();
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleDelete = async (convId, e) => {
    e.stopPropagation();
    if (!user) return;
    await deleteConversation(user.uid, convId);
    if (activeConvId === convId) startNewChat();
    loadConversations();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const d = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const quickPrompts = [
    "Jelasin cara kerja AI dong 🤖",
    "Bantu aku belajar coding dari nol",
    "Kasih aku motivasi hari ini 💪",
    "Gimana cara berpikir lebih kreatif?",
    "Ceritain fakta unik yang jarang diketahui",
    "Apa yang lagi trending di dunia tech?",
  ];

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden", background: "var(--bg-primary)" }}>

      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        style={{
          position: "fixed", left: 0, top: 0, bottom: 0, width: 300, zIndex: 200,
          background: "var(--bg-secondary)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", padding: "20px 0"
        }}
      >
        <div style={{ padding: "0 16px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: avatarBg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
              }}>✦</div>
              <span style={{ fontFamily: "Playfair Display", fontWeight: 700, fontSize: 16 }}>Trive AI</span>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(false)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 20 }}
            >✕</motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={startNewChat}
            style={{
              width: "100%", padding: "11px 0", fontSize: 14, border: "none",
              borderRadius: 50, cursor: "pointer", fontFamily: "DM Sans", fontWeight: 700,
              background: avatarBg, color: avatarColor
            }}
          >+ Chat Baru</motion.button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
          {conversations.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, marginTop: 40, padding: "0 16px" }}>
              Belum ada percakapan. Mulai chat dengan Mizzy!
            </p>
          ) : conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => loadConversation(conv.id)}
              style={{
                padding: "12px 14px", borderRadius: 12, cursor: "pointer", marginBottom: 4,
                display: "flex", alignItems: "center", gap: 10,
                background: activeConvId === conv.id ? "rgba(168,255,62,0.08)" : "transparent",
                border: activeConvId === conv.id ? "1px solid var(--border)" : "1px solid transparent",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>💬</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {conv.title || "Chat baru"}
                </div>
                {conv.lastMessage && (
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {conv.lastMessage}
                  </div>
                )}
              </div>
              <motion.button whileTap={{ scale: 0.85 }} onClick={e => handleDelete(conv.id, e)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 13, padding: 4 }}
              >🗑</motion.button>
            </motion.div>
          ))}
        </div>

        {user && (
          <div style={{ padding: "16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 700, color: avatarColor, flexShrink: 0
            }}>{name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
              <div style={{ fontSize: 11, color: "var(--accent)" }}>● Online</div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => { logoutUser(); navigate("/"); }}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--text-secondary)", fontSize: 11, fontFamily: "DM Sans" }}
            >Keluar</motion.button>
          </div>
        )}
      </motion.div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Topbar */}
        <motion.div
          initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{
            padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: topbarBg, backdropFilter: "blur(24px)",
            borderBottom: "1px solid var(--border)", flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 10, width: 38, height: 38, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "var(--text-primary)"
              }}
            >☰</motion.button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  width: 38, height: 38, borderRadius: 12, background: avatarBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, boxShadow: "0 0 20px var(--glow)"
                }}
              >✦</motion.div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Mizzy</div>
                <div style={{ fontSize: 11, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>●</motion.span>
                  Siap ngobrol
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={startNewChat}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "8px 14px", cursor: "pointer",
                color: "var(--text-secondary)", fontSize: 13, fontFamily: "DM Sans",
                display: "flex", alignItems: "center", gap: 6
              }}
            >✏️ Baru</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 10, width: 38, height: 38, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
              }}
            >{isLight ? "🌙" : "🌷"}</motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 16px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            <AnimatePresence>
              {showWelcome && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  style={{ textAlign: "center", paddingTop: 40, paddingBottom: 40 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{ fontSize: 64, marginBottom: 20 }}
                  >{isLight ? "🌷" : "✦"}</motion.div>
                  <h2 style={{ fontSize: "clamp(22px, 4vw, 34px)", marginBottom: 10 }}>
                    Hei {name}! Aku <span className="glow-text">Mizzy</span> 👋
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 36px" }}>
                    Teman AI kamu yang siap ngobrol soal apapun. Dari hal serius sampai yang santai. Mau mulai dari mana?
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, textAlign: "left" }}>
                    {quickPrompts.map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        whileHover={{ scale: 1.02, borderColor: "var(--accent)", y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                        style={{
                          padding: "13px 16px", cursor: "pointer",
                          border: "1px solid var(--border)", borderRadius: 14,
                          textAlign: "left", background: "var(--bg-card)",
                          color: "var(--text-secondary)", fontSize: 13,
                          fontFamily: "DM Sans", lineHeight: 1.5, transition: "all 0.2s ease"
                        }}
                      >{prompt}</motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loadingMsgs && (
              <div style={{ textAlign: "center", paddingTop: 80 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ fontSize: 32, display: "inline-block" }}
                >{isLight ? "🌷" : "✦"}</motion.div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 16, alignItems: "flex-end", gap: 8
                  }}
                >
                  {msg.role === "mizzy" && (
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: avatarBg,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                    }}>{isLight ? "🌷" : "✦"}</div>
                  )}
                  <div style={{ maxWidth: "78%" }}>
                    <div style={{
                      padding: "13px 18px",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: msg.role === "user" ? userMsgBg : "var(--bg-card)",
                      color: msg.role === "user" ? userMsgColor : "var(--text-primary)",
                      border: msg.role === "mizzy" ? "1px solid var(--border)" : "none",
                      fontSize: 15, lineHeight: 1.7,
                      boxShadow: msg.role === "user" ? "0 4px 20px var(--glow)" : "var(--shadow)",
                      whiteSpace: "pre-wrap"
                    }}>
                      {msg.image && (
                        <img src={msg.image} alt="uploaded"
                          style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 8, display: "block" }}
                        />
                      )}
                      {msg.content}
                    </div>
                    <div style={{
                      fontSize: 10, marginTop: 4, color: "var(--text-secondary)",
                      textAlign: msg.role === "user" ? "right" : "left",
                      paddingLeft: msg.role === "mizzy" ? 8 : 0,
                      paddingRight: msg.role === "user" ? 8 : 0,
                    }}>{formatTime(msg.timestamp)}</div>
                  </div>
                  {msg.role === "user" && (
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: avatarBg, color: avatarColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700
                    }}>{name.charAt(0).toUpperCase()}</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: avatarBg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                  }}>{isLight ? "🌷" : "✦"}</div>
                  <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "4px 18px 18px 18px",
                    padding: "16px 20px", display: "flex", gap: 5, alignItems: "center"
                  }}>
                    {[0, 1, 2].map(j => (
                      <motion.div key={j}
                        animate={{ y: [-5, 5, -5], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.15 }}
                        style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px 20px",
          background: inputBg, backdropFilter: "blur(24px)",
          borderTop: "1px solid var(--border)", flexShrink: 0
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 10, position: "relative", display: "inline-block" }}
                >
                  <img src={imagePreview} alt="preview"
                    style={{ height: 80, borderRadius: 12, border: "1px solid var(--border)", objectFit: "cover" }}
                  />
                  <motion.button whileTap={{ scale: 0.85 }}
                    onClick={() => { setImageBase64(null); setImagePreview(null); }}
                    style={{
                      position: "absolute", top: -8, right: -8, width: 22, height: 22,
                      borderRadius: "50%", background: "#ff4444", border: "none", cursor: "pointer",
                      fontSize: 11, color: "white", display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >✕</motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 18, padding: "8px 8px 8px 16px"
            }}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              <motion.button
                whileHover={{ scale: 1.1, color: "var(--accent)" }} whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: imagePreview ? "var(--accent)" : "var(--text-secondary)",
                  display: "flex", alignItems: "center", padding: "6px 2px",
                  transition: "color 0.2s ease", flexShrink: 0, fontSize: 22
                }}
              >⊕</motion.button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder="Tanya Mizzy apapun... (Enter kirim)"
                rows={1}
                style={{
                  flex: 1, resize: "none", overflow: "hidden",
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)",
                  fontFamily: "DM Sans", padding: "6px 0", maxHeight: 140,
                }}
              />
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !imageBase64)}
                style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: (input.trim() || imageBase64) ? sendBtnGradient : "var(--bg-secondary)",
                  border: "none",
                  cursor: (input.trim() || imageBase64) ? "pointer" : "default",
                  fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                  boxShadow: (input.trim() || imageBase64) ? "0 4px 16px var(--glow)" : "none",
                  color: (input.trim() || imageBase64) ? sendBtnColor : "var(--text-secondary)"
                }}
              >
                {loading ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block", fontSize: 16 }}
                  >⟳</motion.span>
                ) : "↑"}
              </motion.button>
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-secondary)", marginTop: 8 }}>
              Mizzy bisa salah. Selalu verifikasi informasi penting. • Trive AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}