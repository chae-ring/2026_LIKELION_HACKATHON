import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RecommendationsScreen from "./screens/RecommendationsScreen";
import SplashScreen from "./screens/SplashScreen";
import CollectionDetailScreen from "./screens/collection/CollectionDetailScreen";
import CollectionScreen from "./screens/collection/CollectionScreen";
import CertificateStepScreen from "./screens/registration/CertificateStepScreen";
import ProductStepScreen from "./screens/registration/ProductStepScreen";
import StoryStepScreen from "./screens/registration/StoryStepScreen";
import type { Emotion, Product, Screen } from "./types";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("accessToken"),
  );

  const [screen, setScreen] = useState<Screen>("home");
  const [product, setProduct] = useState<Product | null>(null);
  const [registrationId, setRegistrationId] = useState("");
  const [story, setStory] = useState("");
  const [emotions, setEmotions] = useState<Emotion[]>([]);

  // TODO(효빈님 PRD-002 실연동 완료 시 교체): 아직 registrationId(문자열)만
  // 나오고 실제 userProductId(숫자)는 안 나옴. 효빈님 작업 끝나면
  // registrationId 대신 실제 userProductId를 여기로 연결해야 함.
  const [userProductId] = useState<number>(1);

  const [selectedItem, setSelectedItem] = useState<{
    artworkId: number;
    userProductId: number;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const userId = params.get("userId");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);

      if (userId) {
        localStorage.setItem("userId", userId);
      }

      setIsAuthenticated(true);
      setScreen("home");

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const go = (nextScreen: Screen) => {
    setScreen(nextScreen);
  };

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
            onNext={(nextProduct, nextRegistrationId) => {
              setProduct(nextProduct);
              setRegistrationId(nextRegistrationId);
              go("step2");
            }}
          />
        )}

        {isAuthenticated && screen === "step2" && (
          <StoryStepScreen
            registrationId={registrationId}
            onBack={() => go("step1")}
            onNext={(nextStory, nextEmotions) => {
              setStory(nextStory);
              setEmotions(nextEmotions);
              go("step3");
            }}
          />
        )}

        {isAuthenticated && screen === "step3" && product && (
          <CertificateStepScreen
            product={product}
            story={story}
            emotions={emotions}
            userProductId={userProductId}
            onBack={() => go("step2")}
            onNext={() => go("recommendations")}
          />
        )}

        {isAuthenticated && screen === "recommendations" && (
          <RecommendationsScreen
            onBack={() => go("step3")}
            onCollection={() => go("collection")}
          />
        )}

        {isAuthenticated && screen === "collection" && (
          <CollectionScreen
            onBack={() => go("home")}
            onDetail={(item) => {
              setSelectedItem(item);
              go("collection-detail");
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
  );
}