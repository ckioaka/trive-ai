import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, loginWithGoogle } from "../firebase/auth";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Email dan password wajib diisi"); return; }
    if (mode === "register" && !form.name) { setError("Nama wajib diisi"); return; }
    if (form.password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(form.email, form.password, form.name);
      } else {
        await loginUser(form.email, form.password);
      }
      navigate("/chat");
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Email atau password salah");
      } else if (msg.includes("email-already-in-use")) {
        setError("Email sudah terdaftar, silakan login");
      } else if (msg.includes("weak-password")) {
        setError("Password terlalu lemah");
      } else if (msg.includes("invalid-email")) {
        setError("Format email tidak valid");
      } else {
        setError("Terjadi kesalahan: " + msg.slice(0, 50));
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/chat");
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("popup-closed")) {
        setError("Login dibatalkan");
      } else if (msg.includes("popup-blocked")) {
        setError("Popup diblokir, coba lagi");
      } else if (msg.includes("unauthorized-domain")) {
        setError("Domain belum diauthorize di Firebase");
      } else {
        setError("Google login gagal: " + msg.slice(0, 50));
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: 20, position: "relative", overflow: "hidden",
      background: "var(--bg-primary)"
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: "absolute", width: 600, height: 600,
            borderRadius: "50%", top: -250, right: -200,
            background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
            filter: "blur(80px)"
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 4 }}
          style={{
            position: "absolute", width: 500, height: 500,
            borderRadius: "50%", bottom: -200, left: -150,
            background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
            filter: "blur(80px)"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: 420, padding: "44px 36px", position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #a78bfa, #7c5cfc, #38bdf8)",
              display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontSize: 30,
              marginBottom: 16, boxShadow: "0 0 40px rgba(167,139,250,0.4)",
              position: "relative"
            }}
          >
            🪐
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute", inset: -4,
                border: "2px solid rgba(167,139,250,0.3)",
                borderRadius: "50%", borderTopColor: "rgba(56,189,248,0.6)"
              }}
            />
          </motion.div>
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>
            {mode === "login" ? "Selamat datang kembali" : "Bergabung dengan Trive AI"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {mode === "login" ? "Lanjutkan obrolan dengan Mizzy 💬" : "Kenalan sama Mizzy, AI companion kamu ✨"}
          </p>
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex", background: "var(--bg-secondary)",
          borderRadius: 50, padding: 4, marginBottom: 28
        }}>
          {["login", "register"].map(m => (
            <motion.button
              key={m}
              onClick={() => { setMode(m); setError(""); setForm({ name: "", email: "", password: "" }); setShowPass(false); }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 50, border: "none",
                cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "DM Sans",
                background: mode === m ? "linear-gradient(135deg, #a78bfa, #7c5cfc)" : "transparent",
                color: mode === m ? "#ffffff" : "var(--text-secondary)",
                transition: "all 0.3s ease"
              }}
            >{m === "login" ? "Masuk" : "Daftar"}</motion.button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <AnimatePresence>
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  placeholder="Nama kamu"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", borderRadius: 14, padding: "14px 18px", fontSize: 15 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            placeholder="Alamat email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={{ width: "100%", borderRadius: 14, padding: "14px 18px", fontSize: 15 }}
          />

          {/* Password with working show/hide */}
          <div style={{ position: "relative" }}>
            <input
              placeholder="Password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%", borderRadius: 14,
                padding: "14px 70px 14px 18px", fontSize: 15
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(prev => !prev)}
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", padding: "4px 8px",
                color: showPass ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 11, fontFamily: "DM Sans",
                fontWeight: 600, letterSpacing: 1,
                transition: "color 0.2s ease"
              }}
            >{showPass ? "HIDE" : "SHOW"}</button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "rgba(255,80,80,0.08)",
                border: "1px solid rgba(255,80,80,0.25)",
                borderRadius: 12, padding: "11px 16px",
                color: "#ff6b6b", fontSize: 13, marginBottom: 14,
                display: "flex", alignItems: "center", gap: 8
              }}
            >⚠️ {error}</motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(167,139,250,0.3)" }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", fontSize: 15, padding: "14px 0", marginBottom: 14 }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block" }}
              >⟳</motion.span> Loading...
            </span>
          ) : mode === "login" ? "Masuk →" : "Buat Akun →"}
        </motion.button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 14, color: "var(--text-secondary)", fontSize: 12
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          atau
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Google */}
        <motion.button
          whileHover={{ scale: 1.02, borderColor: "var(--accent)" }}
          whileTap={{ scale: 0.98 }}
          className="btn-secondary"
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: "100%", fontSize: 14, padding: "13px 0" }}
        >🔍 Lanjutkan dengan Google</motion.button>
      </motion.div>
    </div>
  );
}