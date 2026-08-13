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
import type { Certificate, Emotion, Product, Screen } from "./types"

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [screen, setScreen] = useState<Screen>("home")
  const [product, setProduct] = useState<Product | null>(null)
  const [story, setStory] = useState("")
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [certs, setCerts] = useState<Certificate[]>([])
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

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
            onBack={() => go("step2")}
            onNext={(certificate) => {
              setCerts((previous) => [...previous, certificate])
              go("recommendations")
            }}
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
            certs={certs}
            onBack={() => go("home")}
            onDetail={(certificate) => {
              setSelectedCert(certificate)
              go("collection-detail")
            }}
          />
        )}
        {screen === "collection-detail" && selectedCert && (
          <CollectionDetailScreen
            cert={selectedCert}
            onBack={() => go("collection")}
            onRecommendations={() => go("recommendations")}
          />
        )}
      </div>
    </div>
  )
}
