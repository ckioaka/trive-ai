import { motion } from "framer-motion";

export default function Logo({ size = 40, theme = "dark" }) {
  const isLight = theme === "light";

  return (
    <motion.div
      style={{
        width: size, height: size,
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
      {/* Orbit ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: size * 0.9, height: size * 0.4,
          border: isLight
            ? "1.5px solid rgba(196,77,138,0.5)"
            : "1.5px solid rgba(167,139,250,0.5)",
          borderRadius: "50%",
          transform: "rotateX(60deg)",
        }}
      />
      {/* Planet */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          width: size * 0.45, height: size * 0.45,
          borderRadius: "50%",
          background: isLight
            ? "linear-gradient(135deg, #e066a8, #c44d8a, #f472b6)"
            : "linear-gradient(135deg, #a78bfa, #7c5cfc, #38bdf8)",
          boxShadow: isLight
            ? "0 0 15px rgba(196,77,138,0.5), inset -3px -3px 8px rgba(0,0,0,0.2)"
            : "0 0 20px rgba(167,139,250,0.6), inset -3px -3px 8px rgba(0,0,0,0.3)",
          position: "relative", zIndex: 2
        }}
      />
      {/* Small moon/dot orbiting */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: size * 0.9, height: size * 0.9,
          display: "flex", alignItems: "flex-start", justifyContent: "center"
        }}
      >
        <div style={{
          width: size * 0.12, height: size * 0.12,
          borderRadius: "50%",
          background: isLight ? "#f472b6" : "#38bdf8",
          boxShadow: isLight ? "0 0 6px #f472b6" : "0 0 8px #38bdf8",
          marginTop: size * 0.02
        }} />
      </motion.div>
      {/* Growth arrow */}
      <motion.div
        animate={{ y: [-1, 1, -1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: "absolute",
          bottom: 0, right: 0,
          fontSize: size * 0.28,
          lineHeight: 1,
          filter: "drop-shadow(0 0 4px rgba(167,139,250,0.8))"
        }}
      >↗</motion.div>
    </motion.div>
  );
}