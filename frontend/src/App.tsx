import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | 'home'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'recommendations'
  | 'collection'
  | 'collection-detail'

type Emotion = '기쁨' | '자부심' | '설렘' | '감사'

interface Product {
  id: string
  name: string
  model: string
  color: string
  category: string
  serial: string
  imageUrl: string
}

interface Certificate {
  product: Product
  story: string
  emotions: Emotion[]
  artworkUrl: string
  createdAt: string
  registeredAt: Date
}

// AS 보증 기간 (월 단위), null = 확인 불가
const WARRANTY_MONTHS: Record<string, number | null> = {
  Backpack: 24,
  'Shoulder Bag': 24,
  Tote: 24,
  'Crossbody Bag': 24,
  Wallet: 12,
}

const CARE_TIPS: Record<string, string[]> = {
  default: [
    '마른 부드러운 천으로 표면을 가볍게 닦아주세요.',
    '직사광선과 열원을 피해 서늘하고 통풍이 잘 되는 곳에 보관하세요.',
    '보관 시 방습제를 함께 넣고 먼지 커버를 씌워주세요.',
    '날카로운 물건과 함께 보관하지 마세요.',
    '물이 닿았다면 부드러운 천으로 즉시 닦은 뒤 자연 건조하세요.',
  ],
  Wallet: [
    '카드와 현금은 적정량만 수납하여 형태를 유지하세요.',
    '마른 부드러운 천으로 표면을 가볍게 닦아주세요.',
    '직사광선과 열원을 피해 서늘하고 통풍이 잘 되는 곳에 보관하세요.',
    '보관 시 방습제를 함께 넣어주세요.',
  ],
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const VALID_SERIALS: Record<string, Product> = {
  'MCM2024001': {
    id: 'p1',
    name: 'Stark Backpack Medium',
    model: 'MUK Visetos Original',
    color: 'Cognac',
    category: 'Backpack',
    serial: 'MCM2024001',
    imageUrl: 'https://images.unsplash.com/photo-1637759292654-a12cb2be085e?w=400&h=400&fit=crop&auto=format',
  },
  'MCM2024002': {
    id: 'p2',
    name: 'Milano Shoulder Bag',
    model: 'MWS Visetos Original',
    color: 'Black',
    category: 'Shoulder Bag',
    serial: 'MCM2024002',
    imageUrl: 'https://images.unsplash.com/photo-1589363460779-cd717d2ed8fa?w=400&h=400&fit=crop&auto=format',
  },
  'MCM2024003': {
    id: 'p3',
    name: 'Patricia Tote Large',
    model: 'MWT Visetos Original',
    color: 'Loden',
    category: 'Tote',
    serial: 'MCM2024003',
    imageUrl: 'https://images.unsplash.com/photo-1575403538007-acb790100421?w=400&h=400&fit=crop&auto=format',
  },
}

const RECOMMENDED: Array<{
  name: string
  category: string
  season: string
  reason: string
  imageUrl: string
}> = [
  {
    name: 'Aren Backpack Small',
    category: 'Backpack',
    season: '2025 S/S',
    reason: '등록하신 Stark와 동일한 Visetos 패턴으로 완벽한 세트를 완성합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1746880223690-359948154c53?w=400&h=500&fit=crop&auto=format',
  },
  {
    name: 'Klara Crossbody',
    category: 'Crossbody Bag',
    season: '2025 S/S',
    reason: '가벼운 데일리 캐리를 위한 미니멀한 실루엣으로 어떤 룩에도 어울립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1711548244653-72219aa9ac27?w=400&h=500&fit=crop&auto=format',
  },
  {
    name: 'Himmel Card Wallet',
    category: 'Wallet',
    season: '2025 S/S',
    reason: '코냑 컬러와 동일한 소가죽 마감으로 완성도 높은 코디를 제안합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1682031215004-161c99d5b225?w=400&h=500&fit=crop&auto=format',
  },
]

const ARTWORK_URLS = [
  'https://images.unsplash.com/photo-1761437856299-af640f6e75ad?w=600&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1761437856311-3ba13025f161?w=600&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1761437856144-99d74817b551?w=600&h=600&fit=crop&auto=format',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ViseteosPattern() {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="vis" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="9" fill="none" stroke="#B8924A" strokeWidth="0.7" opacity="0.4" />
          <circle cx="30" cy="30" r="4" fill="none" stroke="#B8924A" strokeWidth="0.5" opacity="0.4" />
          <circle cx="30" cy="30" r="1.5" fill="#B8924A" opacity="0.5" />
          <line x1="30" y1="17" x2="30" y2="43" stroke="#B8924A" strokeWidth="0.5" opacity="0.3" />
          <line x1="17" y1="30" x2="43" y2="30" stroke="#B8924A" strokeWidth="0.5" opacity="0.3" />
          <line x1="21" y1="21" x2="39" y2="39" stroke="#B8924A" strokeWidth="0.4" opacity="0.25" />
          <line x1="39" y1="21" x2="21" y2="39" stroke="#B8924A" strokeWidth="0.4" opacity="0.25" />
          <circle cx="0" cy="0" r="2.5" fill="none" stroke="#B8924A" strokeWidth="0.5" opacity="0.35" />
          <circle cx="60" cy="0" r="2.5" fill="none" stroke="#B8924A" strokeWidth="0.5" opacity="0.35" />
          <circle cx="0" cy="60" r="2.5" fill="none" stroke="#B8924A" strokeWidth="0.5" opacity="0.35" />
          <circle cx="60" cy="60" r="2.5" fill="none" stroke="#B8924A" strokeWidth="0.5" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#vis)" />
    </svg>
  )
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px 0' }}>
      {([1, 2, 3] as const).map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: s < 3 ? 1 : 'none' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: s <= step ? 'var(--brown)' : 'var(--cream-dark)',
            color: s <= step ? 'var(--warm-white)' : 'var(--brown-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
            flexShrink: 0, transition: 'all 0.3s ease',
          }}>
            {s < step ? '✓' : s}
          </div>
          {s < 3 && (
            <div style={{
              flex: 1, height: 1,
              background: s < step ? 'var(--brown)' : 'var(--cream-dark)',
              transition: 'background 0.3s ease',
            }} />
          )}
        </div>
      ))}
      <span style={{
        fontFamily: 'Outfit, sans-serif', fontSize: 12,
        color: 'var(--brown-light)', letterSpacing: '0.04em',
        marginLeft: 8,
      }}>
        {step}/3
      </span>
    </div>
  )
}

function TopBar({ onBack, label }: { onBack?: () => void; label?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '18px 20px 0',
      gap: 12,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, color: 'var(--brown)', display: 'flex',
        }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <span style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 14, fontWeight: 500, letterSpacing: '0.12em',
        color: 'var(--brown)', opacity: 0.6,
        textTransform: 'uppercase',
      }}>
        {label ?? 'MCMoments'}
      </span>
    </div>
  )
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '17px 24px',
        background: disabled ? 'var(--cream-dark)' : 'var(--brown)',
        color: disabled ? 'var(--brown-light)' : 'var(--warm-white)',
        fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600,
        letterSpacing: '0.05em',
        border: 'none', borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '15px 24px',
        background: 'transparent',
        color: 'var(--brown)',
        fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 500,
        letterSpacing: '0.04em',
        border: '1px solid var(--border)',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}

// ─── Certificate Card ─────────────────────────────────────────────────────────

function CertificateCard({ cert, mini }: { cert: Certificate; mini?: boolean }) {
  const [flipped, setFlipped] = useState(false)
  if (mini) {
    return (
      <div style={{
        background: 'var(--brown)',
        borderRadius: 4, overflow: 'hidden',
        position: 'relative', aspectRatio: '1/1',
        width: '100%',
      }}>
        <ViseteosPattern />
        <img
          src={cert.artworkUrl} alt="artwork"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, mixBlendMode: 'luminosity' }}
        />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px', background: 'linear-gradient(transparent, rgba(14,8,2,0.85))',
        }}>
          <p style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 11, color: 'var(--gold-light)', letterSpacing: '0.08em' }}>
            {cert.product.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flip-card" style={{ width: '100%', cursor: 'pointer' }} onClick={() => setFlipped((f) => !f)}>
      <div className={`flip-card-inner${flipped ? ' flipped' : ''}`} style={{ width: '100%' }}>

        {/* Front */}
        <div className="flip-card-front" style={{
          background: 'var(--brown)', borderRadius: 6,
          overflow: 'hidden', position: 'relative',
          width: '100%',
        }}>
          <ViseteosPattern />
          <div style={{ position: 'relative', zIndex: 1, padding: 24 }}>
            {/* header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>MCM</p>
                <p style={{ margin: '2px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'rgba(253,250,244,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Digital Certificate</p>
              </div>
              <div style={{
                border: '1px solid var(--gold)', padding: '3px 8px', borderRadius: 1,
                fontFamily: 'Outfit, sans-serif', fontSize: 8, color: 'var(--gold)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>
                Authentic
              </div>
            </div>

            {/* artwork */}
            <div style={{
              aspectRatio: '1/1', borderRadius: 4, overflow: 'hidden',
              marginBottom: 20, position: 'relative', background: 'rgba(0,0,0,0.3)',
            }}>
              <img
                src={cert.artworkUrl} alt="AI generated artwork"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75, mixBlendMode: 'luminosity' }}
              />
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                background: 'rgba(184,146,74,0.2)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(184,146,74,0.4)',
                borderRadius: 2, padding: '4px 8px',
                fontFamily: 'Outfit, sans-serif', fontSize: 8, color: 'var(--gold-light)',
                letterSpacing: '0.1em',
              }}>
                AI Artwork
              </div>
            </div>

            {/* info */}
            <div style={{ borderTop: '1px solid rgba(184,146,74,0.2)', paddingTop: 16 }}>
              <p style={{ margin: '0 0 4px', fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--warm-white)', fontWeight: 500 }}>
                {cert.product.name}
              </p>
              <p style={{ margin: '0 0 12px', fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'rgba(253,250,244,0.5)', letterSpacing: '0.06em' }}>
                {cert.product.model}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>발급일</p>
                  <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--warm-white)' }}>{cert.createdAt}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Serial</p>
                  <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--warm-white)', fontFamily: 'monospace' }}>
                    ····{cert.product.serial.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            {/* flip hint */}
            <div style={{
              marginTop: 16, display: 'flex', alignItems: 'center', gap: 4,
              color: 'rgba(184,146,74,0.6)',
              fontFamily: 'Outfit, sans-serif', fontSize: 10, letterSpacing: '0.08em',
            }}>
              탭하여 뒷면 보기
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back" style={{
          background: 'var(--cream)', borderRadius: 6,
          border: '1px solid var(--border)',
          overflow: 'hidden', position: 'absolute', inset: 0,
          padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 11, color: 'var(--brown)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>MCM</p>
              <p style={{ margin: '2px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'var(--brown-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>My Story</p>
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, color: 'var(--brown-light)', letterSpacing: '0.06em' }}>
              탭하여 앞면 보기
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 8px', fontFamily: 'Outfit, sans-serif', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>구매 사연</p>
            <p style={{
              margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 14,
              color: 'var(--brown)', lineHeight: 1.75, fontStyle: 'italic',
            }}>
              "{cert.story}"
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 10px', fontFamily: 'Outfit, sans-serif', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>담긴 감정</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {cert.emotions.map((e) => (
                <span key={e} style={{
                  padding: '5px 12px',
                  border: '1px solid var(--brown-mid)',
                  borderRadius: 40, fontFamily: 'Outfit, sans-serif',
                  fontSize: 12, color: 'var(--brown)',
                }}>
                  {e}
                </span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'var(--brown-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>제품명</p>
                <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown)' }}>{cert.product.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'var(--brown-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>컬러</p>
                <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown)' }}>{cert.product.color}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screens ──────────────────────────────────────────────────────────────────

// 1. Home
function HomeScreen({ onStart, onCollection }: { onStart: () => void; onCollection: () => void }) {
  return (
    <div className="fade-up" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Header brand */}
      <div style={{ padding: '48px 24px 0', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Playfair Display, serif', fontSize: 13,
          letterSpacing: '0.35em', color: 'var(--brown)',
          textTransform: 'uppercase', margin: 0,
        }}>MCM</p>
        <p style={{
          fontFamily: 'Playfair Display, serif', fontSize: 18,
          letterSpacing: '0.02em', color: 'var(--brown)',
          margin: '4px 0 0', fontWeight: 500,
        }}>MC<span style={{ color: 'var(--gold)' }}>M</span>oments</p>
      </div>

      {/* Hero text */}
      <div style={{ padding: '36px 28px 24px' }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 32, fontWeight: 500, lineHeight: 1.25,
          color: 'var(--brown)', margin: 0,
        }}>
          나의 MCM<br />순간을<br />기록하세요
        </h1>
        <p style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 14, lineHeight: 1.7,
          color: 'var(--brown-light)', margin: '14px 0 0',
        }}>
          첫 MCM 제품과의 특별한 순간을 AI가<br />
          Visetos 패턴으로 담은 디지털 아트워크로<br />
          영원히 간직하세요.
        </p>
      </div>

      {/* Preview certificate card */}
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <div style={{
          background: 'var(--brown)', borderRadius: 6,
          overflow: 'hidden', position: 'relative',
          aspectRatio: '3/2',
        }}>
          <ViseteosPattern />
          <img
            src="https://images.unsplash.com/photo-1761437856299-af640f6e75ad?w=600&h=400&fit=crop&auto=format"
            alt="Sample digital artwork certificate"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, mixBlendMode: 'luminosity' }}
          />
          <div style={{ position: 'absolute', inset: 0, padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.2em' }}>MCM</p>
                <p style={{ margin: '2px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 8, color: 'rgba(253,250,244,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Digital Certificate</p>
              </div>
              <span style={{
                border: '1px solid var(--gold)', padding: '3px 8px',
                fontFamily: 'Outfit, sans-serif', fontSize: 8, color: 'var(--gold)',
                letterSpacing: '0.15em',
              }}>Sample</span>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontFamily: 'Playfair Display, serif', fontSize: 15, color: 'var(--warm-white)', fontWeight: 500 }}>Stark Backpack Medium</p>
              <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 10, color: 'rgba(253,250,244,0.4)' }}>MUK Visetos Original · Cognac</p>
            </div>
          </div>
        </div>
        <p style={{
          textAlign: 'center', margin: '10px 0 0',
          fontFamily: 'Outfit, sans-serif', fontSize: 10,
          color: 'var(--brown-light)', letterSpacing: '0.06em',
        }}>
          ↑ AI가 생성한 개인 맞춤 디지털 보증서 예시
        </p>
      </div>

      {/* Buttons */}
      <div style={{ padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
        <PrimaryBtn onClick={onStart}>제품 등록 시작하기</PrimaryBtn>
        <SecondaryBtn onClick={onCollection}>My Collection 보기</SecondaryBtn>
      </div>
    </div>
  )
}

// 2. Step 1 – Serial Number
function Step1Screen({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: (product: Product) => void
}) {
  const [serial, setSerial] = useState('')
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<Product | null>(null)
  const [touched, setTouched] = useState(false)

  const handleCheck = () => {
    setTouched(true)
    const upper = serial.trim().toUpperCase()
    if (!upper) { setError('시리얼 넘버를 입력해 주세요.'); return }
    if (upper === 'MCM9999') { setError('이미 등록된 시리얼 넘버입니다.'); setConfirmed(null); return }
    const found = VALID_SERIALS[upper]
    if (!found) { setError('유효하지 않은 시리얼 넘버입니다. 제품 내부 태그를 확인해 주세요.'); setConfirmed(null); return }
    setError('')
    setConfirmed(found)
  }

  return (
    <div className="fade-up" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} />
      <StepIndicator step={1} />

      <div style={{ padding: '28px 24px 0' }}>
        <p style={{ margin: '0 0 4px', fontFamily: 'Outfit, sans-serif', fontSize: 11, letterSpacing: '0.15em', color: 'var(--brown-light)', textTransform: 'uppercase' }}>Step 1</p>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 500, color: 'var(--brown)', lineHeight: 1.3 }}>
          제품을<br />등록해 주세요
        </h2>
        <p style={{ margin: '12px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown-light)', lineHeight: 1.6 }}>
          제품 내부 태그 또는 포장 박스에서<br />시리얼 넘버를 확인하세요.
        </p>
      </div>

      <div style={{ padding: '32px 24px 0' }}>
        {/* Serial input */}
        <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--brown)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          시리얼 넘버
        </label>
        <div style={{ marginTop: 8, position: 'relative' }}>
          <input
            value={serial}
            onChange={(e) => { setSerial(e.target.value); if (touched) setError(''); setConfirmed(null) }}
            placeholder="예: MCM2024001"
            style={{
              width: '100%', padding: '15px 16px',
              fontFamily: 'Outfit, sans-serif', fontSize: 15,
              background: 'var(--warm-white)',
              border: `1px solid ${error ? '#c0392b' : 'var(--border)'}`,
              borderRadius: 2, color: 'var(--brown)',
              outline: 'none', letterSpacing: '0.04em',
            }}
          />
        </div>
        {error && (
          <p style={{ margin: '8px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#c0392b' }}>
            {error}
          </p>
        )}

        {/* Help tip */}
        <div style={{
          marginTop: 16, padding: '12px 14px',
          background: 'var(--cream-mid)', borderRadius: 2,
          borderLeft: '2px solid var(--gold)',
        }}>
          <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--brown-mid)', lineHeight: 1.6 }}>
            💡 시리얼 넘버는 영문+숫자 9-12자리입니다.<br />
            테스트: <strong>MCM2024001</strong>, <strong>MCM2024002</strong>
          </p>
        </div>

        {/* Confirmed product card */}
        {confirmed && (
          <div className="fade-up" style={{
            marginTop: 24, background: 'var(--warm-white)',
            border: '1px solid var(--border)', borderRadius: 4,
            overflow: 'hidden',
          }}>
            <img
              src={confirmed.imageUrl} alt={confirmed.name}
              style={{ width: '100%', height: 180, objectFit: 'cover' }}
            />
            <div style={{ padding: '16px 18px' }}>
              <p style={{ margin: '0 0 2px', fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--brown)', fontWeight: 500 }}>{confirmed.name}</p>
              <p style={{ margin: '0 0 14px', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown-light)' }}>{confirmed.model}</p>
              <div style={{ display: 'flex', gap: 20 }}>
                {[['컬러', confirmed.color], ['카테고리', confirmed.category]].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</p>
                    <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27ae60', display: 'inline-block' }} />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: '#27ae60' }}>등록 가능한 제품입니다</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '24px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!confirmed && <PrimaryBtn onClick={handleCheck}>시리얼 넘버 확인</PrimaryBtn>}
        {confirmed && <PrimaryBtn onClick={() => onNext(confirmed)}>다음 단계로</PrimaryBtn>}
      </div>
    </div>
  )
}

// 3. Step 2 – Story
function Step2Screen({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: (story: string, emotions: Emotion[]) => void
}) {
  const [story, setStory] = useState('')
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [error, setError] = useState('')

  const EMOTIONS: Emotion[] = ['기쁨', '자부심', '설렘', '감사']
  const MAX = 500
  const MIN = 20

  const toggleEmotion = (e: Emotion) => {
    setEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])
  }

  const handleNext = () => {
    if (story.length < MIN) { setError(`최소 ${MIN}자 이상 작성해 주세요. (현재 ${story.length}자)`); return }
    if (emotions.length === 0) { setError('감정을 하나 이상 선택해 주세요.'); return }
    setError('')
    onNext(story, emotions)
  }

  return (
    <div className="fade-up" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} />
      <StepIndicator step={2} />

      <div style={{ padding: '28px 24px 0' }}>
        <p style={{ margin: '0 0 4px', fontFamily: 'Outfit, sans-serif', fontSize: 11, letterSpacing: '0.15em', color: 'var(--brown-light)', textTransform: 'uppercase' }}>Step 2</p>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 500, color: 'var(--brown)', lineHeight: 1.3 }}>
          이 제품을<br />선택한 순간을<br />들려주세요
        </h2>
      </div>

      <div style={{ padding: '28px 24px 0', flex: 1 }}>
        {/* Textarea */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={story}
            onChange={(e) => { setStory(e.target.value.slice(0, MAX)); setError('') }}
            placeholder="졸업 선물로 스스로에게 처음 선물한 가방이에요. 오랫동안 모아온 돈으로 구입한 순간, 말로 표현할 수 없는 뿌듯함이 밀려왔습니다..."
            rows={6}
            style={{
              width: '100%', padding: '14px 16px',
              fontFamily: 'Outfit, sans-serif', fontSize: 14, lineHeight: 1.7,
              background: 'var(--warm-white)',
              border: `1px solid ${error ? '#c0392b' : 'var(--border)'}`,
              borderRadius: 2, color: 'var(--brown)',
              outline: 'none', resize: 'none',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 12, right: 14,
            fontFamily: 'Outfit, sans-serif', fontSize: 11,
            color: story.length >= MIN ? 'var(--brown-light)' : '#c0392b',
          }}>
            {story.length} / {MAX}
          </div>
        </div>
        {error && (
          <p style={{ margin: '8px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#c0392b' }}>
            {error}
          </p>
        )}

        {/* Emotion chips */}
        <div style={{ marginTop: 24 }}>
          <p style={{ margin: '0 0 12px', fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--brown)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            담긴 감정 선택
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EMOTIONS.map((e) => {
              const active = emotions.includes(e)
              return (
                <button
                  key={e}
                  onClick={() => toggleEmotion(e)}
                  style={{
                    padding: '10px 18px',
                    background: active ? 'var(--brown)' : 'transparent',
                    color: active ? 'var(--warm-white)' : 'var(--brown)',
                    border: `1px solid ${active ? 'var(--brown)' : 'var(--border)'}`,
                    borderRadius: 40, cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {e}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', marginTop: 'auto' }}>
        <PrimaryBtn onClick={handleNext} disabled={story.length < MIN}>
          아트워크 만들기
        </PrimaryBtn>
      </div>
    </div>
  )
}

// 4. Step 3 – Artwork Result
function Step3Screen({
  product,
  story,
  emotions,
  onNext,
  onBack,
}: {
  product: Product
  story: string
  emotions: Emotion[]
  onNext: (cert: Certificate) => void
  onBack: () => void
}) {
  const [phase, setPhase] = useState<'loading' | 'success' | 'fail'>('loading')
  const [cert, setCert] = useState<Certificate | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      // Simulate 90% success
      if (Math.random() < 0.9) {
        const now = new Date()
        const c: Certificate = {
          product,
          story,
          emotions,
          artworkUrl: ARTWORK_URLS[Math.floor(Math.random() * ARTWORK_URLS.length)],
          createdAt: formatDate(now),
          registeredAt: now,
        }
        setCert(c)
        setPhase('success')
      } else {
        setPhase('fail')
      }
    }, 2800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fade-up" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} />
      <StepIndicator step={3} />

      <div style={{ padding: '28px 24px 0' }}>
        <p style={{ margin: '0 0 4px', fontFamily: 'Outfit, sans-serif', fontSize: 11, letterSpacing: '0.15em', color: 'var(--brown-light)', textTransform: 'uppercase' }}>Step 3</p>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 500, color: 'var(--brown)', lineHeight: 1.3 }}>
          {phase === 'loading' && '아트워크를\n생성하고 있어요'}
          {phase === 'success' && '당신의 아트워크가\n완성되었습니다'}
          {phase === 'fail' && '아트워크를\n다시 만들어드릴게요'}
        </h2>
      </div>

      <div style={{ padding: '28px 24px 0', flex: 1 }}>
        {/* Loading state */}
        {phase === 'loading' && (
          <div>
            {/* Skeleton */}
            <div className="skeleton" style={{ background: 'var(--brown)', borderRadius: 6, aspectRatio: '1/1', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
              <ViseteosPattern />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                {/* Spinner */}
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <svg className="spin-slow" width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="rgba(184,146,74,0.2)" strokeWidth="2" />
                    <path d="M24 4 A20 20 0 0 1 44 24" stroke="#B8924A" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--gold)',
                  }}>✦</div>
                </div>
                <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'rgba(253,250,244,0.5)', letterSpacing: '0.1em' }}>
                  Visetos 패턴 분석 중…
                </p>
              </div>
            </div>
            {/* Skeleton rows */}
            {[80, 55, 65].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 14, borderRadius: 2, background: 'var(--cream-dark)', marginBottom: 10, width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* Success */}
        {phase === 'success' && cert && (
          <div className="fade-up">
            <CertificateCard cert={cert} />
            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: 'var(--cream-mid)', borderRadius: 2,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown)' }}>
                내 컬렉션에 저장되었습니다.
              </p>
            </div>
          </div>
        )}

        {/* Fail */}
        {phase === 'fail' && (
          <div className="fade-up">
            <div style={{
              background: 'var(--brown)', borderRadius: 6, padding: 28,
              position: 'relative', overflow: 'hidden', textAlign: 'center',
            }}>
              <ViseteosPattern />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--gold)', margin: '0 0 12px' }}>✦</p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'rgba(253,250,244,0.6)', margin: 0, lineHeight: 1.6 }}>
                  AI 생성 중 오류가 발생했습니다.<br />대체 아트워크를 준비했습니다.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <SecondaryBtn onClick={() => { setPhase('loading'); setTimeout(() => { const now = new Date(); const c: Certificate = { product, story, emotions, artworkUrl: ARTWORK_URLS[1], createdAt: formatDate(now), registeredAt: now }; setCert(c); setPhase('success') }, 2000) }}>
                다시 만들기
              </SecondaryBtn>
            </div>
          </div>
        )}
      </div>

      {phase === 'success' && cert && (
        <div style={{ padding: '24px', marginTop: 'auto' }}>
          <PrimaryBtn onClick={() => onNext(cert)}>추천 상품 보기</PrimaryBtn>
        </div>
      )}
    </div>
  )
}

// 5. Recommendations
function RecommendationsScreen({ onCollection, onBack }: { onCollection: () => void; onBack: () => void }) {
  return (
    <div className="fade-up" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} label="추천 상품" />

      <div style={{ padding: '28px 24px 0' }}>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 500, color: 'var(--brown)', lineHeight: 1.3 }}>
          당신을 위한<br />다음 MCM
        </h2>
        <p style={{ margin: '10px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown-light)', lineHeight: 1.6 }}>
          등록하신 제품과 어울리는 2025 S/S 컬렉션을 선별했습니다.
        </p>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {RECOMMENDED.map((item, i) => (
          <div key={i} style={{
            background: 'var(--warm-white)', borderRadius: 4,
            border: '1px solid var(--border)', overflow: 'hidden',
            display: 'flex', gap: 0,
          }}>
            <img
              src={item.imageUrl} alt={item.name}
              style={{ width: 110, flexShrink: 0, objectFit: 'cover' }}
            />
            <div style={{ padding: '16px 16px 16px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '2px 8px', background: 'var(--cream-dark)',
                    borderRadius: 2, fontFamily: 'Outfit, sans-serif',
                    fontSize: 9, color: 'var(--brown-mid)', letterSpacing: '0.08em',
                  }}>{item.category}</span>
                  <span style={{
                    padding: '2px 8px', border: '1px solid var(--border)',
                    borderRadius: 2, fontFamily: 'Outfit, sans-serif',
                    fontSize: 9, color: 'var(--gold)', letterSpacing: '0.08em',
                  }}>{item.season}</span>
                </div>
                <p style={{ margin: '0 0 6px', fontFamily: 'Playfair Display, serif', fontSize: 15, color: 'var(--brown)', fontWeight: 500 }}>
                  {item.name}
                </p>
                <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'var(--brown-light)', lineHeight: 1.5 }}>
                  {item.reason}
                </p>
              </div>
              <button style={{
                marginTop: 12, padding: '8px 0', background: 'none',
                border: 'none', borderBottom: '1px solid var(--brown)',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'Outfit, sans-serif', fontSize: 11,
                color: 'var(--brown)', letterSpacing: '0.06em',
              }}>
                상품 자세히 보기 →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 24px 40px' }}>
        <PrimaryBtn onClick={onCollection}>My Collection으로 이동</PrimaryBtn>
      </div>
    </div>
  )
}

// ─── AS 기간 계산 헬퍼 ────────────────────────────────────────────────────────

function getWarrantyInfo(cert: Certificate): {
  status: 'active' | 'expiring' | 'expired' | 'unknown'
  expiryDate: Date | null
  monthsLeft: number | null
} {
  const months = WARRANTY_MONTHS[cert.product.category] ?? null
  if (months === null) return { status: 'unknown', expiryDate: null, monthsLeft: null }
  const expiry = new Date(cert.registeredAt)
  expiry.setMonth(expiry.getMonth() + months)
  const now = new Date()
  const msLeft = expiry.getTime() - now.getTime()
  const monthsLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24 * 30))
  if (msLeft <= 0) return { status: 'expired', expiryDate: expiry, monthsLeft: 0 }
  if (monthsLeft <= 3) return { status: 'expiring', expiryDate: expiry, monthsLeft }
  return { status: 'active', expiryDate: expiry, monthsLeft }
}

const WARRANTY_STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: '보증 기간 내', color: '#1a6b3c', bg: 'rgba(39,174,96,0.1)' },
  expiring: { label: '만료 예정',    color: '#8b5e00', bg: 'rgba(241,196,15,0.12)' },
  expired:  { label: '보증 만료',    color: '#9b2929', bg: 'rgba(192,57,43,0.1)' },
  unknown:  { label: '확인 필요',    color: 'var(--brown-mid)', bg: 'var(--cream-mid)' },
}

// ─── 6. My Collection ────────────────────────────────────────────────────────

function CollectionScreen({
  certs,
  onBack,
  onDetail,
}: {
  certs: Certificate[]
  onBack: () => void
  onDetail: (cert: Certificate) => void
}) {
  // 서버 응답을 시뮬레이션: 생성 시각 내림차순 정렬 + 600ms 로딩
  const [loading, setLoading] = useState(true)
  const [sorted, setSorted] = useState<Certificate[]>([])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      setSorted([...certs].sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime()))
      setLoading(false)
    }, 600)
    return () => clearTimeout(t)
  }, [certs])

  return (
    <div className="fade-up" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} label="My Collection" />

      <div style={{ padding: '28px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 500, color: 'var(--brown)' }}>
            My Collection
          </h2>
          <p style={{ margin: '6px 0 0', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown-light)' }}>
            {loading ? '불러오는 중…' : `${sorted.length}개의 디지털 보증서 · 최신순`}
          </p>
        </div>
      </div>

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div style={{ padding: '8px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 4, background: 'var(--cream-dark)', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, borderRadius: 2, background: 'var(--cream-dark)', width: '80%', marginBottom: 5 }} />
              <div className="skeleton" style={{ height: 10, borderRadius: 2, background: 'var(--cream-dark)', width: '55%' }} />
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && sorted.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--cream-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--brown-light)',
            marginBottom: 20,
          }}>✦</div>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--brown)', margin: '0 0 8px' }}>아직 등록된 제품이 없어요</p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown-light)', margin: 0, lineHeight: 1.6 }}>
            첫 MCM 순간을 기록하고<br />디지털 보증서를 만들어보세요.
          </p>
        </div>
      )}

      {/* 목록 */}
      {!loading && sorted.length > 0 && (
        <div style={{ padding: '0 24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {sorted.map((cert, i) => {
            const { status } = getWarrantyInfo(cert)
            const badge = WARRANTY_STATUS_LABEL[status]
            return (
              <div
                key={i}
                onClick={() => onDetail(cert)}
                style={{ cursor: 'pointer' }}
              >
                {/* 썸네일 카드 */}
                <div style={{ borderRadius: 4, overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                  <CertificateCard cert={cert} mini />
                  {/* AS 상태 뱃지 */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    padding: '3px 7px', borderRadius: 2,
                    background: badge.bg,
                    fontFamily: 'Outfit, sans-serif', fontSize: 9,
                    color: badge.color, letterSpacing: '0.06em',
                  }}>
                    {badge.label}
                  </div>
                </div>
                <p style={{ margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown)', fontWeight: 500, lineHeight: 1.3 }}>
                  {cert.product.name}
                </p>
                <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 10, color: 'var(--brown-light)' }}>
                  {cert.createdAt}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Collection Detail ────────────────────────────────────────────────────────

function CollectionDetailScreen({
  cert,
  onBack,
  onRecommendations,
}: {
  cert: Certificate
  onBack: () => void
  onRecommendations: () => void
}) {
  const warranty = getWarrantyInfo(cert)
  const badge = WARRANTY_STATUS_LABEL[warranty.status]
  const careTips = CARE_TIPS[cert.product.category] ?? CARE_TIPS.default

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} label="보증서 상세" />

      <div style={{ overflowY: 'auto', flex: 1, padding: '24px 24px 0' }}>

        {/* 보증서 카드 (플립) */}
        <CertificateCard cert={cert} />

        {/* 제품 기본 정보 */}
        <div style={{
          marginTop: 20, background: 'var(--warm-white)',
          border: '1px solid var(--border)', borderRadius: 4, padding: '18px 20px',
        }}>
          <p style={{ margin: '0 0 14px', fontFamily: 'Outfit, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            제품 정보
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
            {[
              ['제품명', cert.product.name],
              ['모델', cert.product.model],
              ['컬러', cert.product.color],
              ['카테고리', cert.product.category],
              ['시리얼', `····${cert.product.serial.slice(-4)}`],
              ['등록일', cert.createdAt],
            ].map(([k, v]) => (
              <div key={k}>
                <p style={{ margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontSize: 9, color: 'var(--brown-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</p>
                <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown)' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AS 기간 확인 */}
        <div style={{
          marginTop: 16, background: 'var(--warm-white)',
          border: '1px solid var(--border)', borderRadius: 4, padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              AS 보증 기간
            </p>
            <span style={{
              padding: '4px 10px', borderRadius: 2,
              background: badge.bg,
              fontFamily: 'Outfit, sans-serif', fontSize: 10,
              color: badge.color, fontWeight: 600,
            }}>
              {badge.label}
            </span>
          </div>

          {warranty.status === 'unknown' ? (
            /* 확인 불가 */
            <div style={{
              padding: '14px 16px', background: 'var(--cream-mid)',
              borderRadius: 2, borderLeft: '2px solid var(--brown-light)',
            }}>
              <p style={{ margin: '0 0 4px', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown)', fontWeight: 500 }}>
                고객센터에서 확인해 주세요
              </p>
              <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'var(--brown-light)', lineHeight: 1.6 }}>
                해당 제품 카테고리의 AS 기간은<br />
                MCM 고객센터(1588-0000)에서 안내받으실 수 있습니다.
              </p>
            </div>
          ) : (
            <div>
              {/* 만료일 */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown)' }}>만료 예정일</span>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown)', fontWeight: 600 }}>
                  {warranty.expiryDate!.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              {/* 남은 기간 */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
              }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown)' }}>남은 기간</span>
                <span style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
                  color: warranty.status === 'expiring' ? '#8b5e00' : warranty.status === 'expired' ? '#9b2929' : '#1a6b3c',
                }}>
                  {warranty.status === 'expired'
                    ? '보증 종료'
                    : `약 ${warranty.monthsLeft}개월`}
                </span>
              </div>
              {/* 만료 임박 안내 */}
              {warranty.status === 'expiring' && (
                <div style={{
                  padding: '12px 14px', background: 'rgba(241,196,15,0.1)',
                  borderRadius: 2, borderLeft: '2px solid #c9a227',
                  marginTop: 4,
                }}>
                  <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#7a5500', lineHeight: 1.6 }}>
                    보증 기간이 3개월 이내로 남았습니다.<br />
                    AS가 필요하시면 만료 전에 접수하세요.
                  </p>
                </div>
              )}
              {warranty.status === 'expired' && (
                <div style={{
                  padding: '12px 14px', background: 'rgba(192,57,43,0.07)',
                  borderRadius: 2, borderLeft: '2px solid #c0392b',
                  marginTop: 4,
                }}>
                  <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#9b2929', lineHeight: 1.6 }}>
                    보증 기간이 종료되었습니다.<br />
                    유료 수선은 MCM 고객센터(1588-0000)로 문의하세요.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 세탁 및 보관 방법 */}
        <div style={{
          marginTop: 16, marginBottom: 24,
          background: 'var(--warm-white)',
          border: '1px solid var(--border)', borderRadius: 4, padding: '18px 20px',
        }}>
          <p style={{ margin: '0 0 14px', fontFamily: 'Outfit, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            세탁 및 보관 방법
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {careTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--cream-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Outfit, sans-serif', fontSize: 9,
                  color: 'var(--brown-light)', marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <p style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--brown)', lineHeight: 1.65 }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 24px 36px', borderTop: '1px solid var(--border)', background: 'var(--cream)' }}>
        <PrimaryBtn onClick={onRecommendations}>관련 추천 상품 보기</PrimaryBtn>
      </div>
    </div>
  )
}

// ─── Splash ───────────────────────────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 2200)
    const t3 = setTimeout(() => onDone(), 2700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'var(--brown)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'out' ? 0 : 1,
      transition: phase === 'out' ? 'opacity 0.5s ease' : phase === 'in' ? 'opacity 0.4s ease' : 'none',
      overflow: 'hidden',
    }}>
      {/* Visetos full-bleed */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        <ViseteosPattern />
      </div>

      {/* Gold horizontal rule top */}
      <div style={{
        position: 'absolute', top: 72, left: 32, right: 32,
        height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        opacity: phase === 'hold' || phase === 'out' ? 1 : 0,
        transition: 'opacity 0.6s ease 0.3s',
      }} />

      {/* Center lockup */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        opacity: phase === 'hold' || phase === 'out' ? 1 : 0,
        transform: phase === 'hold' || phase === 'out' ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.55s ease 0.15s, transform 0.55s ease 0.15s',
        position: 'relative', zIndex: 1,
      }}>
        {/* Ornament */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 20, opacity: 0.7 }}>
          <path d="M16 2 L18 14 L30 16 L18 18 L16 30 L14 18 L2 16 L14 14 Z" fill="var(--gold)" />
        </svg>

        {/* MCM wordmark */}
        <p style={{
          margin: 0,
          fontFamily: 'Playfair Display, serif',
          fontSize: 11, letterSpacing: '0.5em',
          color: 'rgba(253,250,244,0.5)',
          textTransform: 'uppercase',
        }}>MCM</p>

        {/* Service name */}
        <h1 style={{
          margin: '6px 0 0',
          fontFamily: 'Playfair Display, serif',
          fontSize: 42, fontWeight: 500,
          color: 'var(--warm-white)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}>
          MC<span style={{ color: 'var(--gold)' }}>M</span>oments
        </h1>

        {/* Tagline */}
        <p style={{
          margin: '14px 0 0',
          fontFamily: 'Outfit, sans-serif',
          fontSize: 12, letterSpacing: '0.18em',
          color: 'rgba(253,250,244,0.4)',
          textTransform: 'uppercase',
        }}>
          Your Story. Your Legacy.
        </p>
      </div>

      {/* Gold horizontal rule bottom */}
      <div style={{
        position: 'absolute', bottom: 72, left: 32, right: 32,
        height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        opacity: phase === 'hold' || phase === 'out' ? 1 : 0,
        transition: 'opacity 0.6s ease 0.3s',
      }} />

      {/* Loading dot */}
      <div style={{
        position: 'absolute', bottom: 48,
        display: 'flex', gap: 6,
        opacity: phase === 'hold' ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: '50%',
            background: 'var(--gold)',
            animation: `skeleton-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            opacity: 0.6,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [screen, setScreen] = useState<Screen>('home')
  const [product, setProduct] = useState<Product | null>(null)
  const [story, setStory] = useState('')
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [certs, setCerts] = useState<Certificate[]>([])
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

  const go = (s: Screen) => setScreen(s)

  const containerStyle: React.CSSProperties = {
    maxWidth: 390,
    margin: '0 auto',
    minHeight: '100vh',
    background: 'var(--cream)',
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <div style={{ background: 'var(--brown)', minHeight: '100vh' }}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div style={containerStyle}>
        {screen === 'home' && (
          <HomeScreen
            onStart={() => go('step1')}
            onCollection={() => go('collection')}
          />
        )}
        {screen === 'step1' && (
          <Step1Screen
            onBack={() => go('home')}
            onNext={(p) => { setProduct(p); go('step2') }}
          />
        )}
        {screen === 'step2' && (
          <Step2Screen
            onBack={() => go('step1')}
            onNext={(s, e) => { setStory(s); setEmotions(e); go('step3') }}
          />
        )}
        {screen === 'step3' && product && (
          <Step3Screen
            product={product}
            story={story}
            emotions={emotions}
            onBack={() => go('step2')}
            onNext={(cert) => { setCerts((prev) => [...prev, cert]); go('recommendations') }}
          />
        )}
        {screen === 'recommendations' && (
          <RecommendationsScreen
            onBack={() => go('step3')}
            onCollection={() => go('collection')}
          />
        )}
        {screen === 'collection' && (
          <CollectionScreen
            certs={certs}
            onBack={() => go('home')}
            onDetail={(cert) => { setSelectedCert(cert); go('collection-detail') }}
          />
        )}
        {screen === 'collection-detail' && selectedCert && (
          <CollectionDetailScreen
            cert={selectedCert}
            onBack={() => go('collection')}
            onRecommendations={() => go('recommendations')}
          />
        )}
      </div>
    </div>
  )
}
