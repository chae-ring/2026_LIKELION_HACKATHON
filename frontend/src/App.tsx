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

import type { Certificate, Emotion, Product, Screen } from "./types";

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

  const [certs, setCerts] = useState<Certificate[]>([]);

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  /**
   * Google OAuth 로그인 성공 후
   *
   * 백엔드가 다음과 같이 프론트로 redirect:
   *
   * http://localhost:8443/
   * ?accessToken=xxxxx
   * &userId=1
   *
   * URL에서 JWT를 꺼내 localStorage에 저장한다.
   */
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

      // URL에서 JWT 제거
      // ex)
      // /?accessToken=xxxx&userId=1
      // →
      // /
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const go = (nextScreen: Screen) => {
    setScreen(nextScreen);
  };

  return (
    <div
      style={{
        background: "var(--brown)",
        minHeight: "100vh",
      }}
    >
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
        {/* 로그인 안 되어 있을 때 */}
        {!isAuthenticated && <LoginScreen />}

        {/* 로그인된 상태의 Home */}
        {isAuthenticated && screen === "home" && (
          <HomeScreen
            onStart={() => go("step1")}
            onCollection={() => go("collection")}
          />
        )}

        {/* Step 1 - 제품 등록 */}
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

        {/* Step 2 - Story */}
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

        {/* Step 3 - Certificate */}
        {isAuthenticated && screen === "step3" && product && (
          <CertificateStepScreen
            product={product}
            story={story}
            emotions={emotions}
            registrationId={registrationId}
            onBack={() => go("step2")}
            onNext={(certificate) => {
              setCerts((previous) => [...previous, certificate]);

              go("recommendations");
            }}
          />
        )}

        {/* 추천 */}
        {isAuthenticated && screen === "recommendations" && (
          <RecommendationsScreen
            onBack={() => go("step3")}
            onCollection={() => go("collection")}
          />
        )}

        {/* Collection */}
        {isAuthenticated && screen === "collection" && (
          <CollectionScreen
            certs={certs}
            onBack={() => go("home")}
            onDetail={(certificate) => {
              setSelectedCert(certificate);

              go("collection-detail");
            }}
          />
        )}

        {/* Collection 상세 */}
        {isAuthenticated && screen === "collection-detail" && selectedCert && (
          <CollectionDetailScreen
            cert={selectedCert}
            onBack={() => go("collection")}
            onRecommendations={() => go("recommendations")}
          />
        )}
      </div>
    </div>
  );
}
