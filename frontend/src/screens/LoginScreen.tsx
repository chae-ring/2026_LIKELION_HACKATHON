import { useState } from "react"
import VisetosPattern from "../components/decoration/VisetosPattern"

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.4l-3.24-2.52c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.91A6.02 6.02 0 0 1 6.08 12c0-.66.11-1.3.31-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.51l3.35-2.6Z" />
      <path fill="#EA4335" d="M12 5.96c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6C7.18 7.72 9.39 5.96 12 5.96Z" />
    </svg>
  )
}

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setIsLoading(true)
    window.setTimeout(onLogin, 500)
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 300, background: "var(--brown)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.14 }}><VisetosPattern /></div>
        <div style={{ position: "absolute", inset: 20, border: "1px solid rgba(184,146,74,0.3)" }} />
        <div className="fade-up" style={{ textAlign: "center", zIndex: 1 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 2 18 14 30 16 18 18 16 30 14 18 2 16 14 14 16 2Z" fill="var(--gold)" /></svg>
          <p style={{ margin: "18px 0 5px", color: "rgba(253,250,244,0.55)", fontFamily: "Playfair Display, serif", fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase" }}>MCM</p>
          <h1 style={{ margin: 0, color: "var(--warm-white)", fontFamily: "Playfair Display, serif", fontSize: 37, fontWeight: 500 }}>MC<span style={{ color: "var(--gold)" }}>M</span>oments</h1>
        </div>
      </div>
      <section className="fade-up" style={{ flex: 1, padding: "44px 28px 28px", display: "flex", flexDirection: "column", textAlign: "center", animationDelay: "0.12s" }}>
        <p style={{ margin: 0, color: "var(--gold)", fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase" }}>Your Story, Your Legacy</p>
        <h2 style={{ margin: "14px 0 12px", fontFamily: "Playfair Display, serif", fontSize: 27, fontWeight: 500, lineHeight: 1.3 }}>소중한 순간을<br />당신만의 작품으로</h2>
        <p style={{ margin: 0, color: "rgba(46,26,14,0.58)", fontSize: 13, fontWeight: 300, lineHeight: 1.7 }}>MCM 제품에 담긴 이야기를 기록하고<br />세상에 하나뿐인 디지털 보증서를 만나보세요.</p>
        <div style={{ marginTop: "auto", paddingTop: 36 }}>
          <button type="button" onClick={handleLogin} disabled={isLoading} aria-label="Google 계정으로 계속하기" style={{ width: "100%", height: 56, background: "var(--warm-white)", border: "1px solid rgba(46,26,14,0.22)", borderRadius: 2, color: "var(--brown)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 500, cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.65 : 1, boxShadow: "0 8px 24px rgba(46,26,14,0.07)" }}>
            {isLoading ? <span className="spin-slow" style={{ width: 18, height: 18, border: "2px solid var(--cream-dark)", borderTopColor: "var(--brown)", borderRadius: "50%" }} /> : <GoogleIcon />}
            {isLoading ? "로그인 중..." : "Google로 계속하기"}
          </button>
          <p style={{ margin: "18px 8px 0", color: "rgba(46,26,14,0.42)", fontSize: 10, lineHeight: 1.6 }}>계속하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.</p>
        </div>
      </section>
    </main>
  )
}
