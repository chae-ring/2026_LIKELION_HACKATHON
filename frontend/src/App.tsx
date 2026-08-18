import { useEffect, useState } from "react"

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

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("accessToken"),
  )

  const [screen, setScreen] = useState<Screen>("home")

  const [product, setProduct] = useState<Product | null>(null)

  const [purchaseDate, setPurchaseDate] = useState("")

  const [story, setStory] = useState("")

  const [emotions, setEmotions] = useState<Emotion[]>([])

  const [selectedItem, setSelectedItem] = useState<{
    artworkId: number

    userProductId: number
  } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const accessToken = params.get("accessToken")

    const userId = params.get("userId")

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken)

      if (userId) {
        localStorage.setItem("userId", userId)
      }

      setIsAuthenticated(true)

      setScreen("home")

      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false)
      setScreen("home")
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized)
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized)
  }, [])

  const go = (nextScreen: Screen) => {
    setScreen(nextScreen)
  }

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
        {!isAuthenticated && <LoginScreen />}

        {isAuthenticated && screen === "home" && (
          <HomeScreen
            onStart={() => go("step1")}
            onCollection={() => go("collection")}
          />
        )}

        {isAuthenticated && screen === "step1" && (
          <ProductStepScreen
            onBack={() => go("home")}
            onNext={(nextProduct, nextPurchaseDate) => {
              setProduct(nextProduct)

              setPurchaseDate(nextPurchaseDate)

              go("step2")
            }}
          />
        )}

        {isAuthenticated && screen === "step2" && product && (
          <StoryStepScreen
            onBack={() => go("step1")}
            onNext={(nextStory, nextEmotions) => {
              setStory(nextStory)

              setEmotions(nextEmotions)

              go("step3")
            }}
          />
        )}

        {isAuthenticated &&
          screen === "step3" &&
          product && (
            <CertificateStepScreen
              product={product}
              purchaseDate={purchaseDate}
              story={story}
              emotions={emotions}
              onBack={() => go("step2")}
              onNext={() => go("recommendations")}
            />
          )}

        {isAuthenticated && screen === "recommendations" && (
          <RecommendationsScreen
            onCollection={() => go("collection")}
          />
        )}

        {isAuthenticated && screen === "collection" && (
          <CollectionScreen
            onBack={() => go("home")}
            onDetail={(item) => {
              setSelectedItem(item)

              go("collection-detail")
            }}
          />
        )}

        {isAuthenticated && screen === "collection-detail" && selectedItem && (
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
