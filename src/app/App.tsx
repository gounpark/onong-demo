import { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { SuggestedQuestions } from "./components/SuggestedQuestions";
import { BottomInput } from "./components/BottomInput";
import { ChatDemo, ScenarioType } from "./components/ChatDemo";
import { PhoneMockup } from "./components/PhoneMockup";
import { useIsMobile } from "./hooks/useIsMobile";
import { VoiceOverlay } from "./components/chat/VoiceOverlay";

const P: React.CSSProperties = { fontFamily: "'Pretendard', sans-serif" };

const FLOW_BUTTONS = [
  { id: "apple" as ScenarioType, emoji: "🍎", label: "사과 진단" },
  { id: "strawberry" as ScenarioType, emoji: "🍓", label: "딸기 진단" },
  { id: "subsidy" as ScenarioType, emoji: "💰", label: "보조금" },
  { id: "translation" as ScenarioType, emoji: "🌐", label: "통번역" },
  { id: "farming" as ScenarioType, emoji: "📋", label: "영농일지" },
];

const SCENARIO_HOME_TEXT: Record<ScenarioType, string> = {
  apple: "사과 표면에 갈색 반점이 생기는데 무슨 병인가요?",
  strawberry: "최근에 비가 내린 후로 상태가 이상해졌어.",
  subsidy: "받을 수 있는 보조금 확인하기",
  translation: "내일 오전 9시부터 비강자 심기 베트남어로",
  farming: "오늘 딸기밭에 물 주고, 어제 산 비료 5킬로 사용했어.",
  faq: "자주 묻는 질문 알려줘",
};

function ScenarioButtons({
  active,
  onClick,
}: {
  active: ScenarioType | null;
  onClick: (id: ScenarioType) => void;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      {FLOW_BUTTONS.map((s) => (
        <button key={s.id} onClick={() => onClick(s.id)} className="flex flex-col items-center gap-[3px]">
          <div
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center shadow-md border transition-all duration-200 ${
              active === s.id
                ? "bg-[#3170e2] border-[#3170e2] scale-110"
                : "bg-white border-[#e0e0e0] hover:border-[#3170e2] hover:scale-105"
            }`}
          >
            <span className="text-[22px] leading-none">{s.emoji}</span>
          </div>
          <span
            style={{ ...P, fontWeight: 400, fontSize: 9, lineHeight: 1 }}
            className={active === s.id ? "text-[#3170e2]" : "text-[#888]"}
          >
            {s.label.slice(0, 4)}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioType | null>(null);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [homeHighlightedPanel, setHomeHighlightedPanel] = useState<"camera" | "image" | "file" | null>(null);
  const [homePendingImageType, setHomePendingImageType] = useState<"apple" | "strawberry-fruit" | "strawberry-leaf" | null>(null);
  const [showHomeVoice, setShowHomeVoice] = useState(false);
  const [homeVoiceText, setHomeVoiceText] = useState("");
  const [showMobileHome, setShowMobileHome] = useState(false);
  const [showBackTooltip, setShowBackTooltip] = useState(false);
  const homeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearHomeTimers() {
    homeTimers.current.forEach(clearTimeout);
    homeTimers.current = [];
  }

  function handleScenarioSelect(id: ScenarioType) {
    // 채팅 중이면 홈으로 돌아감
    if (showChat) setShowChat(false);
    clearHomeTimers();
    setShowHomeVoice(false);
    setHomeVoiceText("");
    setShowBackTooltip(false);

    if (id === "farming") {
      // 타이핑 없이 바로 홈에서 음성 오버레이
      setIsTyping(false);
      setTypingText("");
      setShowHomeVoice(true);

      const FARMING_TEXT = SCENARIO_HOME_TEXT["farming"];
      const charDelay = Math.min(FARMING_TEXT.length * 35, 900) / FARMING_TEXT.length;
      let vi = 0;

      const t1 = setTimeout(() => {
        const interval = setInterval(() => {
          vi++;
          setHomeVoiceText(FARMING_TEXT.slice(0, vi));
          if (vi >= FARMING_TEXT.length) {
            clearInterval(interval);
            const t2 = setTimeout(() => {
              setShowHomeVoice(false);
              setHomeVoiceText("");
              setActiveScenario(id);
              setShowChat(true);
            }, 800);
            homeTimers.current.push(t2);
          }
        }, charDelay);
        homeTimers.current.push(interval as unknown as ReturnType<typeof setTimeout>);
      }, 700);
      homeTimers.current.push(t1);
      return;
    }

    setIsTyping(true);
    setTypingText("");

    const targetText = SCENARIO_HOME_TEXT[id];
    let i = 0;
    const charDelay = Math.min(targetText.length * 35, 1000) / targetText.length;

    const interval = setInterval(() => {
      i++;
      setTypingText(targetText.slice(0, i));
      if (i >= targetText.length) {
        clearInterval(interval);
        setTimeout(() => {
          setTypingText("");
          setIsTyping(false);
          if (id === "strawberry") {
            // 메인에서 이미지 선택 패널 애니메이션
            setIsInputExpanded(true);
            setTimeout(() => setHomeHighlightedPanel("image"), 500);
            setTimeout(() => { setIsInputExpanded(false); setHomeHighlightedPanel(null); }, 1100);
            setTimeout(() => setHomePendingImageType("strawberry-fruit"), 1300);
            setTimeout(() => {
              setHomePendingImageType(null);
              setActiveScenario(id);
              setShowChat(true);
            }, 2100);
          } else {
            setActiveScenario(id);
            setShowChat(true);
          }
        }, 500);
      }
    }, charDelay);
  }

  // clean up on unmount
  useEffect(() => () => clearHomeTimers(), []);

  const handleBack = () => {
    setShowChat(false);
    setShowBackTooltip(false);
    if (isMobile) {
      setShowMobileHome(false); // 시나리오 선택 화면으로 돌아감
      setActiveScenario(null);
    }
  };

  const handleQuestionClick = (question: string) => {
    // Simple detection for home screen question clicks
    const lower = question.toLowerCase();
    let id: ScenarioType = "apple";
    if (lower.includes("딸기")) id = "strawberry";
    else if (lower.includes("보조금")) id = "subsidy";
    else if (lower.includes("일지") || lower.includes("일정")) id = "farming";
    else if (lower.includes("자주")) id = "faq";
    handleScenarioSelect(id);
  };

  const handleChipClick = (chipLabel: string) => {
    let id: ScenarioType = "apple";
    if (chipLabel.includes("보조금")) id = "subsidy";
    else if (chipLabel.includes("캘린더") || chipLabel.includes("일지")) id = "farming";
    handleScenarioSelect(id);
  };

  // ── Home view ────────────────────────────────────────────────────────────────
  const homeView = (
    <div
      className="bg-white relative w-[375px] overflow-hidden"
      style={{ height: 812, paddingTop: 46 }}
    >
      <Header />
      <HeroSection onChipClick={handleChipClick} />
      <SuggestedQuestions onQuestionClick={handleQuestionClick} />
      <div className="absolute bottom-0 left-0 right-0">
        <HomeBottomInput
          isExpanded={isInputExpanded}
          onToggleExpanded={() => setIsInputExpanded(!isInputExpanded)}
          highlightedOption={homeHighlightedPanel}
          pendingImageType={homePendingImageType}
          onSend={(value) => {
            const lower = value.toLowerCase();
            let id: ScenarioType = "apple";
            if (lower.includes("딸기")) id = "strawberry";
            else if (lower.includes("보조금")) id = "subsidy";
            else if (lower.includes("일지")) id = "farming";
            else if (lower.includes("자주")) id = "faq";
            handleScenarioSelect(id);
          }}
          typingText={typingText}
          isTyping={isTyping}
        />
      </div>
      {showHomeVoice && (
        <VoiceOverlay
          onClose={() => { clearHomeTimers(); setShowHomeVoice(false); setHomeVoiceText(""); }}
          transcriptionText={homeVoiceText || undefined}
        />
      )}
    </div>
  );

  // ── Chat view ────────────────────────────────────────────────────────────────
  const chatView = (
    <ChatDemo
      key={activeScenario}
      scenario={activeScenario}
      onBack={handleBack}
      onFlowComplete={() => { if (isMobile) setShowBackTooltip(true); }}
      showBackTooltip={showBackTooltip}
    />
  );

  // ── Mobile layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    // 채팅 중
    if (showChat) {
      return <div style={{ width: "100%", maxWidth: 430 }}>{chatView}</div>;
    }
    // 버튼 누른 후 → 홈 메인 (타이핑 애니메이션)
    if (showMobileHome) {
      return <div style={{ width: "100%", maxWidth: 430 }}>{homeView}</div>;
    }
    // 첫 화면: 시나리오 선택
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100dvh",
          background: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 영역 */}
        <div style={{ background: "#3170e2", padding: "52px 24px 28px" }}>
          <p style={{ ...P, fontWeight: 400, fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
            안녕하세요!
          </p>
          <p style={{ ...P, fontWeight: 700, fontSize: 22, color: "white", lineHeight: 1.4 }}>
            오농 에이전트가<br />도와드릴게요 🌱
          </p>
          <p style={{ ...P, fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
            체험할 시나리오를 선택해보세요
          </p>
        </div>

        {/* 시나리오 버튼 목록 */}
        <div style={{ flex: 1, padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
          {FLOW_BUTTONS.map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setShowMobileHome(true);     // 홈 메인 화면으로
                handleScenarioSelect(btn.id); // 타이핑 → 자동으로 채팅 전환
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 20px",
                borderRadius: 16,
                border: "1.5px solid #eee",
                background: "white",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.15s",
                width: "100%",
              }}
            >
              <span style={{ fontSize: 32, lineHeight: 1 }}>{btn.emoji}</span>
              <div>
                <p style={{ ...P, fontWeight: 600, fontSize: 16, color: "#111" }}>{btn.label}</p>
                <p style={{ ...P, fontWeight: 400, fontSize: 12, color: "#aaa", marginTop: 2 }}>
                  {SCENARIO_HOME_TEXT[btn.id]}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Desktop layout ───────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center gap-[32px]"
      style={{ background: "#f2f2f7" }}
    >
      {/* Left hint */}
      <div className="flex flex-col items-center gap-[12px] w-[120px]">
        <div className="text-[28px]">👉</div>
        <p
          style={{
            ...P,
            fontWeight: 500,
            fontSize: 13,
            color: "#888",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          화면 옆 버튼을 눌러<br />시나리오를<br />선택해 보세요
        </p>
      </div>

      {/* Center phone mockup */}
      <PhoneMockup>
        {showChat ? chatView : homeView}
      </PhoneMockup>

      {/* Right scenario buttons */}
      <ScenarioButtons active={activeScenario} onClick={handleScenarioSelect} />
    </div>
  );
}

// ── HomeBottomInput helper ───────────────────────────────────────────────────
function HomeBottomInput({
  isExpanded,
  onToggleExpanded,
  onSend,
  typingText,
  isTyping,
  highlightedOption,
  pendingImageType,
}: {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onSend: (value: string) => void;
  typingText?: string;
  isTyping?: boolean;
  highlightedOption?: "camera" | "image" | "file" | null;
  pendingImageType?: "apple" | "strawberry-fruit" | "strawberry-leaf" | null;
}) {
  const [value, setValue] = useState("");

  const displayValue = isTyping ? typingText ?? "" : value;

  return (
    <BottomInput
      isExpanded={isExpanded}
      onToggleExpanded={onToggleExpanded}
      inputValue={displayValue}
      onInputChange={isTyping ? undefined : setValue}
      highlightedOption={highlightedOption}
      pendingImageType={pendingImageType}
      onSend={() => {
        if (!isTyping && value.trim()) {
          onSend(value.trim());
          setValue("");
        }
      }}
    />
  );
}
