import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tunnel: {
          base: "#0D0E11",     // Than Đất Nén (Nền hầm tối OLED)
          surface: "#16181D",  // Card khối âm bản
          border: "#2A2D35",   // Viền phân tách không gian
          amber: "#E5A93C",    // Vàng Đèn Bão (Quả Cầu Âm Bản & Tương tác)
          amberDark: "#B45309",// Vàng đất sẫm
          jade: "#2DD4BF",     // Ngọc Dạ Quang (An toàn & Lối thoát hiểm)
          rust: "#9A3412",     // Đất Đỏ Củ Chi
          chalk: "#F3F4F6",    // Trắng Vôi tương phản cao
          muted: "#94A3B8",    // Xám tro chú thích
          alert: "#EF4444",    // Đỏ cảnh báo mất sóng
        },
      },
      boxShadow: {
        "lantern-glow": "0 0 45px rgba(229, 169, 60, 0.4)",
        "lantern-active": "0 0 70px rgba(229, 169, 60, 0.7)",
        "jade-beacon": "0 0 25px rgba(45, 212, 191, 0.35)",
        "panic-torch": "0 0 100px rgba(45, 212, 191, 0.8)",
      },
      animation: {
        "orb-breathe": "orbBreathe 4s ease-in-out infinite",
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ticker-scroll": "ticker 20s linear infinite",
      },
      keyframes: {
        orbBreathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
