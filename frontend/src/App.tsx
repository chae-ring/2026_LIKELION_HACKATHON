import { useState } from "react"
import HomeScreen from "./screens/HomeScreen"
import LoginScreen from "./screens/LoginScreen"
import RecommendationsScreen from "./screens/RecommendationsScreen"
import SplashScreen from "./screens/SplashScreen"
import CollectionDetailScreen from "./screens/collection/CollectionDetailScreen"
import CollectionScreen from "./screens/collection/CollectionScreen"
import CertificateStepScreen from "./screens/registration/CertificateStepScreen"
import ProductStepScreen from "./screens/registration/ProductStepScreen"
import StoryStepScreen from "./screens/registration/StoryStepScreen"
import type { Emotion, Product, Screen } from "./types"

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [screen, setScreen] = useState<Screen>("home")
  const [product, setProduct] = useState<Product | null>(null)
  const [story, setStory] = useState("")
  const [emotions, setEmotions] = useState<Emotion[]>([])

  // TODO(효빈님 PRD-002 실연동 완료 시 교체): ProductStepScreen이 아직 mock이라
  // 실제 userProductId를 안 돌려줌. 효빈님 작업 끝나면 onNext에서 받은 실제 값으로
  // 바꿔야 함. 지금은 ART/COL/REC 테스트용 임시값.
  const [userProductId] = useState<number>(1)

  // My Collection에서 상세로 넘어갈 때 쓰는 식별자 (전체 인증서를 들고
  // 다니지 않고, 서버에서 다시 조회할 수 있는 id만 들고 다님 - COL-001 요건)
  const [selectedItem, setSelectedItem] = useState<{
    artworkId: number
    userProductId: number
  } | null>(null)

  const go = (nextScreen: Screen) => setScreen(nextScreen)

  return (
    <div style={{ background: "var(--brown)", minHeight: "100vh" }}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div
        style={{
          maxWidth: 390,
          margin: "0 auto",
          minHeight: "100vh",
          background: "var(--cream)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!isAuthenticated && (
          <LoginScreen onLogin={() => setIsAuthenticated(true)} />
        )}
        {isAuthenticated && screen === "home" && (
          <HomeScreen
            onStart={() => go("step1")}
            onCollection={() => go("collection")}
          />
        )}
        {screen === "step1" && (
          <ProductStepScreen
            onBack={() => go("home")}
            onNext={(nextProduct) => {
              setProduct(nextProduct)
              go("step2")
            }}
          />
        )}
        {screen === "step2" && (
          <StoryStepScreen
            onBack={() => go("step1")}
            onNext={(nextStory, nextEmotions) => {
              setStory(nextStory)
              setEmotions(nextEmotions)
              go("step3")
            }}
          />
        )}
        {screen === "step3" && product && (
          <CertificateStepScreen
            product={product}
            story={story}
            emotions={emotions}
            userProductId={userProductId}
            onBack={() => go("step2")}
            onNext={() => go("recommendations")}
          />
        )}
        {screen === "recommendations" && (
          <RecommendationsScreen
            onBack={() => go("step3")}
            onCollection={() => go("collection")}
          />
        )}
        {screen === "collection" && (
          <CollectionScreen
            onBack={() => go("home")}
            onDetail={(item) => {
              setSelectedItem(item)
              go("collection-detail")
            }}
          />
        )}
        {screen === "collection-detail" && selectedItem && (
          <CollectionDetailScreen
            artworkId={selectedItem.artworkId}
            userProductId={selectedItem.userProductId}
            onBack={() => go("collection")}
            onRecommendations={() => go("recommendations")}
          />
        )}
      </div>
    </div>
  )
}