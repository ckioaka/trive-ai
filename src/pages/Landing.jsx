import Logo from "../components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Landing({ toggleTheme, theme }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);

  const words = ["Smarter", "Faster", "Personal", "Powerful", "Different"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>

      {/* Animated background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", width: 700, height: 700,
            borderRadius: "50%", top: -300, right: -200,
            background: "radial-gradient(circle, rgba(168,255,62,0.07) 0%, transparent 70%)",
            filter: "blur(80px)"
          }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          style={{
            position: "absolute", width: 500, height: 500,
            borderRadius: "50%", bottom: -100, left: -150,
            background: "radial-gradient(circle, rgba(168,255,62,0.05) 0%, transparent 70%)",
            filter: "blur(80px)"
          }}
        />
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(rgba(168,255,62,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,255,62,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "18px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: scrolled ? "rgba(6,10,6,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "none",
          transition: "all 0.4s ease"
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <Logo size={38} theme={theme} />
          <span style={{ fontFamily: "Playfair Display", fontSize: 22, fontWeight: 700 }}>
            Trive <span style={{ color: "var(--accent)", fontSize: 14, fontFamily: "DM Sans" }}>AI</span>
          </span>
        </motion.div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 50, width: 38, height: 38, cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >{theme === "dark" ? "☀️" : "🌙"}</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="btn-secondary"
            onClick={() => navigate("/auth")}
            style={{ padding: "9px 20px", fontSize: 14 }}
          >Masuk</motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168,255,62,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={() => navigate("/auth")}
            style={{ padding: "9px 20px", fontSize: 14 }}
          >Mulai Gratis →</motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px",
        position: "relative", zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(168,255,62,0.08)", border: "1px solid rgba(168,255,62,0.2)",
            borderRadius: 50, padding: "8px 18px", marginBottom: 48, fontSize: 13,
            color: "var(--accent)"
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}
          />
          Meet Mizzy — AI yang benar-benar ngerti kamu ✨
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: "clamp(44px, 8vw, 88px)", lineHeight: 1.05, marginBottom: 16 }}>
            AI yang lebih
          </h1>
          <div style={{ height: "clamp(50px, 9vw, 96px)", overflow: "hidden", marginBottom: 16 }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentWord}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="glow-text"
                style={{ fontSize: "clamp(44px, 8vw, 88px)", lineHeight: 1.05, fontStyle: "italic" }}
              >{words[currentWord]}</motion.h1>
            </AnimatePresence>
          </div>
          <h1 style={{ fontSize: "clamp(44px, 8vw, 88px)", lineHeight: 1.05 }}>
            dari biasanya.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: "clamp(16px, 2vw, 19px)", color: "var(--text-secondary)",
            maxWidth: 540, lineHeight: 1.75, marginBottom: 52
          }}
        >
          Trive AI hadir dengan Mizzy — companion AI yang cerdas, hangat, dan selalu ada.
          Bukan sekadar chatbot. Teman yang benar-benar paham kamu.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(168,255,62,0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={() => navigate("/auth")}
            style={{ fontSize: 16, padding: "15px 36px" }}
          >Mulai Gratis →</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary"
            onClick={() => navigate("/chat")}
            style={{ fontSize: 16, padding: "15px 36px" }}
          >Coba Tanpa Akun</motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ display: "flex", gap: 28, color: "var(--text-secondary)", fontSize: 13, flexWrap: "wrap", justifyContent: "center" }}
        >
          {["Gratis selamanya", "Tanpa kartu kredit", "Multi bahasa"].map((t, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--accent)" }}>✓</span> {t}
            </span>
          ))}
        </motion.div>

        {/* Chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ marginTop: 80, width: "100%", maxWidth: 640 }}
        >
          <div className="glass-card" style={{ padding: 24, textAlign: "left" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)"
            }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg, #a8ff3e, #6db32a)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}
              >✦</motion.div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Mizzy</div>
                <div style={{ fontSize: 11, color: "var(--accent)" }}>● Online</div>
              </div>
            </div>
            {[
              { role: "user", text: "Hei Mizzy, jelasin konsep quantum computing dong!" },
              { role: "mizzy", text: "Seru banget topiknya! Bayangin komputer biasa pakai bit yang cuma bisa jadi 0 atau 1. Nah quantum computer pakai qubit yang bisa jadi 0, 1, atau keduanya sekaligus berkat superposisi. Ini bikin dia bisa menyelesaikan masalah yang butuh ribuan tahun buat komputer biasa, hanya dalam hitungan detik. 🚀" },
            ].map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + i * 0.3 }}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12
                }}
              >
                <div style={{
                  maxWidth: "82%", padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                  background: msg.role === "user" ? "linear-gradient(135deg, #a8ff3e, #6db32a)" : "var(--bg-secondary)",
                  color: msg.role === "user" ? "#060a06" : "var(--text-primary)",
                  fontSize: 14, lineHeight: 1.6,
                  border: msg.role === "mizzy" ? "1px solid var(--border)" : "none"
                }}>{msg.text}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 60 }}
        >
          <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", marginBottom: 16 }}>
            Kenapa <span className="glow-text">Trive AI</span> beda?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
            Bukan cuma menjawab pertanyaan. Mizzy benar-benar ada untuk kamu.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {[
            { icon: "🧠", title: "Benar-benar Pintar", desc: "Mizzy didukung model AI terkini. Bisa jawab apapun dari coding, sains, seni, sampai curhat soal hidup." },
            { icon: "💬", title: "Ingat Percakapanmu", desc: "Semua chat tersimpan. Mizzy ingat konteks percakapan sebelumnya jadi tidak perlu repeat diri kamu." },
            { icon: "🌍", title: "Multi Bahasa", desc: "Tulis dalam bahasa apapun. Indonesia, Inggris, atau campur. Mizzy otomatis menyesuaikan." },
            { icon: "⚡", title: "Super Cepat", desc: "Respons dalam hitungan detik. Tidak ada loading lama, tidak ada nunggu frustasi." },
            { icon: "🎭", title: "Kepribadian Unik", desc: "Bukan robot kaku. Mizzy punya humor, empati, dan cara ngobrol yang terasa manusiawi." },
            { icon: "🔒", title: "Data Aman", desc: "Chat kamu tersimpan private di akun kamu sendiri. Tidak ada yang bisa akses selain kamu." },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              style={{ padding: 28 }}
            >
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 14 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ textAlign: "center", padding: "80px 24px 120px", position: "relative", zIndex: 1 }}
      >
        <div className="glass-card" style={{
          maxWidth: 600, margin: "0 auto", padding: "60px 40px",
          border: "1px solid rgba(168,255,62,0.2)",
          boxShadow: "0 0 60px rgba(168,255,62,0.1)"
        }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: 56, marginBottom: 20 }}
          >✦</motion.div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", marginBottom: 16 }}>
            Siap ngobrol dengan <span className="glow-text">Mizzy?</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 16, lineHeight: 1.7 }}>
            Gratis, cepat, dan selalu ada. Mulai percakapan pertamamu sekarang.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(168,255,62,0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={() => navigate("/auth")}
            style={{ fontSize: 17, padding: "16px 40px" }}
          >Mulai Sekarang — Gratis →</motion.button>
        </div>
      </motion.div>
    </div>
  );
}