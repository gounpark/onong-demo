import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "./chat/ChatHeader";
import { BottomInput } from "./BottomInput";
import { UserMessageBubble } from "./chat/UserMessageBubble";
import { AIResponseHeader } from "./chat/AIResponseHeader";
import { AITextResponse } from "./chat/AITextResponse";
import { FarmingLogCard } from "./chat/FarmingLogCard";
import { ActionButton } from "./chat/ActionButton";
import { AlertCard } from "./chat/AlertCard";
import { ChatContainer } from "./chat/ChatContainer";
import { Divider } from "./chat/Divider";
import { DiagnosisResultCard } from "./chat/DiagnosisResultCard";
import { SymptomInfoCard } from "./chat/SymptomInfoCard";
import { ImageMessageBubble } from "./chat/ImageMessageBubble";
import { FAQResponseCard } from "./chat/FAQResponseCard";
import { VoiceOverlay } from "./chat/VoiceOverlay";
import { TreatmentCard } from "./chat/TreatmentCard";
import { ExtraPhotoCard } from "./chat/ExtraPhotoCard";
import { ReferenceImageCard } from "./chat/ReferenceImageCard";
import { SourceBadge } from "./chat/SourceBadge";
import { SourceSheet } from "./chat/SourceSheet";
import { SubsidyCard, ChipGroup } from "./chat/SubsidyCard";
import { TranslationCard } from "./chat/TranslationCard";
import { LoadingIndicator } from "./chat/LoadingIndicator";

export type ScenarioType = "apple" | "strawberry" | "subsidy" | "translation" | "farming" | "faq";

interface ChatDemoProps {
  scenario?: ScenarioType | null;
  onBack?: () => void;
}

const P: React.CSSProperties = { fontFamily: "'Pretendard', sans-serif" };

function getTimestamp() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(m).padStart(2, "0")}`;
}

// ─── Message types ────────────────────────────────────────────────────────────
type MsgKind = "user-text" | "user-image" | "ai" | "ai-subsidy" | "ai-apple-diagnosis" | "ai-strawberry-stage2" | "ai-farming-step1";
interface ChatMsg {
  id: string;
  kind: MsgKind;
  text?: string;
  imageType?: "apple" | "strawberry-fruit" | "strawberry-leaf";
  content?: React.ReactNode;
  subsidyStepIndex?: number;
  ts: string;
}

// ─── Step types ───────────────────────────────────────────────────────────────
type Step =
  | { at: number; kind: "user-text"; text: string }
  | { at: number; kind: "user-image"; imageType: "apple" | "strawberry-fruit" | "strawberry-leaf"; text: string }
  | { at: number; kind: "loading-on" }
  | { at: number; kind: "loading-off" }
  | { at: number; kind: "ai"; content: React.ReactNode }
  | { at: number; kind: "ai-subsidy"; stepIndex: number }
  | { at: number; kind: "chip-select"; stepIndex: number; value: string }
  | { at: number; kind: "input-type"; text: string; duration: number }
  | { at: number; kind: "input-clear" }
  | { at: number; kind: "panel-open" }
  | { at: number; kind: "panel-close" }
  | { at: number; kind: "panel-highlight"; option: "camera" | "image" | "file" }
  | { at: number; kind: "panel-image-preview"; imageType: "apple" | "strawberry-fruit" | "strawberry-leaf" }
  | { at: number; kind: "open-source-sheet"; srcType: "disease" | "subsidy" }
  | { at: number; kind: "ai-apple-diagnosis" }
  | { at: number; kind: "ai-strawberry-stage2" }
  | { at: number; kind: "voice-open" }
  | { at: number; kind: "voice-close" }
  | { at: number; kind: "ai-farming-step1" }
  | { at: number; kind: "farming-choose"; value: "yes" | "no" };

// ─── Scenario first messages ──────────────────────────────────────────────────
const SCENARIO_FIRST_MESSAGES: Record<ScenarioType,
  | { kind: "text"; text: string }
  | { kind: "image"; imageType: "apple" | "strawberry-fruit" | "strawberry-leaf"; text: string }
  | { kind: "none" }
> = {
  apple: { kind: "text", text: "사과 표면에 갈색 반점이 생기는데 무슨 병인가요?" },
  strawberry: { kind: "none" }, // 홈 패널 → 채팅에서 이미지 첨부 순서로 시작
  subsidy: { kind: "text", text: "받을 수 있는 보조금 확인하기" },
  translation: { kind: "text", text: "내일 오전 9시부터 씨감자 심기 베트남어로" },
  farming: { kind: "text", text: "오늘 딸기밭에 물 주고, 어제 산 비료 5킬로 사용했어." }, // 홈 음성 → 채팅에 바로 표시
  faq: { kind: "text", text: "자주 묻는 질문 알려줘" },
};

// ─── AI Content components ────────────────────────────────────────────────────
function AppleDiagnosisContent({ onSrc, sourceBadgeHighlighted }: { onSrc: () => void; sourceBadgeHighlighted?: boolean }) {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <DiagnosisResultCard crop="사과" disease="사과 탄저병" confidence={92} showAnnotatedImage imageType="apple" />
      <SymptomInfoCard sections={[
        { icon: "✓", title: "발생 시기 및 환경", items: [
          { desc: "주로 여름철 장마기 등 다습한 상황에서 발생합니다." },
          { desc: "과실 표면에 흑갈색 또는 갈색의 원형 반점이 생기며, 빠르게 20~30mm 크기로 커지고 반점이 움푹 패입니다." },
        ]},
        { icon: "🔍", title: "방제 농약 추천", items: [
          { name: "디티아논 수화제", desc: "물과 800배 희석, 수확 21일전 5회" },
          { name: "아족시스트로빈 수화제", desc: "물 2,000배 내외, 7~10일 간격, 수확 7일 전" },
        ]},
      ]} />
      <SourceBadge onOpen={onSrc} highlighted={sourceBadgeHighlighted} />
    </div>
  );
}

function AppleTextContent({ onSrc }: { onSrc: () => void }) {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <AITextResponse>
        <p>사과 표면의 갈색 반점은 주로{" "}
          <span style={{ ...P, fontWeight: 600, color: "#222" }}>"겹무늬썩음병"</span>에
          의해 생기는 경우가 많아요. 과실 표면이 담갈색에서 점차 퍼지며 썩는 특징이 있습니다.
        </p>
      </AITextResponse>
      <SymptomInfoCard sections={[
        { icon: "✓", title: "발생 시기 및 환경", items: [
          { desc: "주로 7~8월" },
          { desc: "장마철과 같이 고온다습하고, 과실 표면에 습기가 오래 남아있는 환경에서 발생합니다." },
        ]},
        { icon: "🍎", title: "증상", items: [
          { desc: "과실 표면에 갈색의 둥글고 작은 반점이 생기고, 점차 병반이 원형 또는 띠모양으로 퍼지며 과육이 검거나 갈색으로 썩습니다." },
        ]},
      ]} />
      <ReferenceImageCard type="apple-ring-rot" />
      <SourceBadge onOpen={onSrc} />
    </div>
  );
}

function StrawberryStage1Content({ onSrc }: { onSrc: () => void }) {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <AITextResponse>
        <p>사진을 확인했습니다.<br />현재 딸기에서 아래와 같은 특징이 관찰되었습니다.</p>
      </AITextResponse>
      <div className="flex flex-col gap-[6px]">
        {["과실 표면에 갈색 반점 및 침식 흔적", "색이 어둡고 표면이 물러짐"].map((obs, i) => (
          <div key={i} className="flex items-start gap-[8px]">
            <span style={{ ...P, fontWeight: 600, fontSize: 13, color: "#3170e2", flexShrink: 0, width: 18 }}>{i + 1}.</span>
            <p style={{ ...P, fontWeight: 400, fontSize: 14, color: "#454545", lineHeight: 1.5 }}>{obs}</p>
          </div>
        ))}
      </div>
      <ExtraPhotoCard message="이런 증상은 영양 부족, 병해, 생리장해 등이 원인일 수 있습니다. 정확한 진단을 위해 추가 사진을 업로드해 주세요." />
      <SourceBadge onOpen={onSrc} />
    </div>
  );
}

function StrawberryStage2Content({ onSrc, sourceBadgeHighlighted }: { onSrc: () => void; sourceBadgeHighlighted?: boolean }) {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <AITextResponse>
        <p>업로드하신 딸기 사진을 분석한 결과, 딸기 병해의 공통 증상으로 미루어 아래와 같은 병해 가능성이 있습니다.</p>
      </AITextResponse>
      <TreatmentCard
        diseaseName="탄저병"
        diseaseNameEn="Anthracnose"
        diagnosisBasis={["잎의 반점과 변색의 확산", "과실의 성장부진", "줄기 갈변 및 검은 반점, 곰팡이 흔적"]}
        treatments={["병든 잎/줄기 제거", "통풍 유지", "약제 살포"]}
        externalLinkLabel="농사로 바로가기"
      />
      <AlertCard emoji="⚡" title="방제 권장" message="다음 살포는 4~5일 후에 진행하시는 것을 추천드리며, 해당 진단 결과를 재배 캘린더에 등록해 드릴까요?" />
      <SourceBadge onOpen={onSrc} highlighted={sourceBadgeHighlighted} />
    </div>
  );
}

function SubsidyStep1Content({ selected }: { selected?: string }) {
  return (
    <div className="flex flex-col gap-[12px] w-full">
      <AITextResponse>
        <p>OOO님 안녕하세요? 몇 가지 질문에 답해주시면 딱 맞는 보조금을 추천해 드릴게요</p>
      </AITextResponse>
      <div className="flex flex-col gap-[8px]">
        <p style={{ ...P, fontWeight: 500, fontSize: 13, color: "#333" }}>어떤 지역에서 활동하고 있나요?</p>
        <ChipGroup chips={["전국","경기","강원","충북","충남","전북","경북","경남","제주","직접입력"]} selected={selected} />
      </div>
    </div>
  );
}

function SubsidyStep2Content({ selected }: { selected?: string }) {
  return (
    <div className="flex flex-col gap-[12px] w-full">
      <AITextResponse><p>어떤 분야에 종사하고 계신가요?</p></AITextResponse>
      <ChipGroup chips={["농업","축산업","임업","기타"]} selected={selected} />
    </div>
  );
}

function SubsidyStep3Content({ selected }: { selected?: string }) {
  return (
    <div className="flex flex-col gap-[12px] w-full">
      <AITextResponse><p>대상유형을 알려주세요</p></AITextResponse>
      <ChipGroup chips={["청년농업인","고령 농업인","초보농업인","귀농귀촌자","기타"]} selected={selected} />
    </div>
  );
}

function SubsidyStep4Content({ selected }: { selected?: string }) {
  return (
    <div className="flex flex-col gap-[12px] w-full">
      <AITextResponse><p>최근에 신청을 희망하시나요, 아니면 예정이신가요?</p></AITextResponse>
      <ChipGroup chips={["현재모집 중","신청 예정"]} selected={selected} />
    </div>
  );
}

function SubsidyResultContent({ onSrc }: { onSrc: () => void }) {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <AITextResponse>
        <p>조건에 맞는 보조금을 찾았어요!<br />가장 적합한 순서부터 차례로 보여드릴게요.</p>
      </AITextResponse>
      <SubsidyCard />
      <SourceBadge onOpen={onSrc} type="subsidy" />
    </div>
  );
}

function TranslationStep1Content() {
  return (
    <div className="flex flex-col gap-[12px] w-full">
      <AITextResponse><p>베트남어로 안내 드릴게요.</p></AITextResponse>
      <TranslationCard
        targetLang="베트남어"
        targetText="Từ 9 giờ sáng mai, bắt đầu trồng khoai tây gừng."
        sourceText="내일 오전 9시부터 비강자 심기"
      />
    </div>
  );
}

function TranslationStep2Content() {
  return (
    <div className="flex flex-col gap-[12px] w-full">
      <AITextResponse><p>베트남어로 안내 드릴게요.</p></AITextResponse>
      <TranslationCard
        targetLang="베트남어"
        targetText={"Quản lý OOO sẽ giải thích cách trồng vào ngày mai:\n1. Hãy sử dụng khoai tây gừng đã mọc mầm.\n2. Đào lỗ cách nhau khoảng 30cm.\n3. Đặt khoai vào lỗ rồi lấp đất lại.\n4. Tưới nước đầy đủ."}
        sourceText={"OOO매니저 내일 심는 법:\n1. 싹이 튼 비강자를 사용해.\n2. 30cm 간격으로 줄에 놓고 심어줘.\n3. 뿌리 넣고 흙으로 덮어줘.\n4. 물을 충분히 줘."}
      />
    </div>
  );
}

function FarmingStep1Content({
  farmingChoice,
  onChoose,
}: {
  farmingChoice: "yes" | "no" | null;
  onChoose: (v: "yes" | "no") => void;
}) {
  const chosen = farmingChoice !== null;
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <AITextResponse>
        <p><span style={{ ...P, fontWeight: 600, color: "#222" }}>오늘(2025년 7월 22일)</span>{" "}
        작업 내용을 현재 위치와 날씨 정보를 기준으로 등록된 농장에 자동 기록했습니다.</p>
      </AITextResponse>
      <FarmingLogCard data={{ date: "2025년 07월 22일", farm: "홍길동의 딸기농장", weather: "맑음 / 28°C", crop: "딸기", work: "물주기", fertilizer: "5kg" }} />
      <div className="flex flex-col gap-[8px]">
        <p style={{ ...P, fontWeight: 400, fontSize: 14, color: "#454545", lineHeight: 1.5 }}>
          더 자세한 정보는 영농일지에서 확인하실 수 있습니다.
        </p>
        <div className="w-fit">
          <ActionButton label="영농일지 보기" />
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-[10px]">
        <AlertCard emoji="⚡️" title="주의" message="다음 주 화요일에는 비가 내릴 예정입니다. ☔ 후속 물주기 날짜를 수요일로 조정하시겠어요?" />
        <div className="flex flex-wrap gap-[6px]">
          {(["yes", "no"] as const).map((v) => {
            const isSelected = farmingChoice === v;
            const isInactive = chosen && !isSelected;
            return (
              <button
                key={v}
                onClick={() => onChoose(v)}
                disabled={isInactive}
                className="px-[12px] py-[7px] rounded-full border transition-all duration-150"
                style={{
                  borderColor: isSelected ? "#3170e2" : isInactive ? "#e8e8e8" : "#ddd",
                  background: isSelected ? "#ebf1ff" : isInactive ? "#f5f5f5" : "white",
                }}
              >
                <p style={{
                  ...P,
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: 13,
                  lineHeight: 1,
                  color: isSelected ? "#3170e2" : isInactive ? "#ccc" : "#444",
                }}>
                  {v === "yes" ? "네, 수요일로 조정할게요" : "아니오"}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FarmingStep2Content() {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <AITextResponse>
        <p>
          <span style={{ ...P, fontWeight: 600, color: "#222" }}>영농 일지의 후속 일정을 2025-07-30(수요일)로 업데이트</span> 하겠습니다.
        </p>
      </AITextResponse>
      <div className="w-full rounded-[10px] border border-[#e8e8e8] bg-white overflow-hidden">
        <div className="px-[14px] pt-[12px] pb-[10px] border-b border-[#f0f0f0] flex items-center gap-[6px]">
          <span>📅</span>
          <p style={{ ...P, fontWeight: 600, fontSize: 13, color: "#222" }}>일정 추가 제안</p>
        </div>
        <div className="flex flex-col gap-[6px] px-[14px] py-[12px]">
          {[
            { label: "작업", value: "물주기 (딸기밭)" },
            { label: "날짜", value: "2025년 7월 30일 (수요일)" },
            { label: "농장", value: "홍길동의 딸기농장" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-[8px]">
              <p style={{ ...P, fontWeight: 400, fontSize: 12, color: "#999", width: 40 }}>{row.label}</p>
              <p style={{ ...P, fontWeight: 500, fontSize: 13, color: "#333" }}>{row.value}</p>
            </div>
          ))}
        </div>
        <div className="px-[14px] pb-[14px]">
          <button className="w-full py-[10px] rounded-[8px] bg-[#3170e2] flex items-center justify-center">
            <p style={{ ...P, fontWeight: 600, fontSize: 13, color: "white" }}>작물 재배 캘린더에 등록하기</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqContent({ onVoice }: { onVoice: () => void }) {
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <FAQResponseCard />
      <button onClick={onVoice} className="flex items-center gap-[8px] px-[16px] py-[10px] bg-[#3170e2] rounded-full shadow-md hover:bg-[#2560d2] transition-colors w-fit">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2.5C6.6 2.5 5.5 3.6 5.5 5V8C5.5 9.4 6.6 10.5 8 10.5C9.4 10.5 10.5 9.4 10.5 8V5C10.5 3.6 9.4 2.5 8 2.5Z" fill="white"/>
          <path d="M3.5 7V8C3.5 10.5 5.5 12.5 8 12.5C10.5 12.5 12.5 10.5 12.5 8V7" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M8 12.5V14.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{ ...P, fontWeight: 500, fontSize: 13, color: "white" }}>음성으로 질문하기</span>
      </button>
    </div>
  );
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
    }}>
      {children}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-[16px] px-[20px] text-center">
      <div className="text-[48px]">🌱</div>
      <p style={{ ...P, fontWeight: 600, fontSize: 16, color: "#333", lineHeight: 1.5 }}>
        화면 옆 버튼을 눌러<br />시나리오를 선택해보세요
      </p>
      <p style={{ ...P, fontWeight: 400, fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>
        사과·딸기 진단, 보조금, 통번역,<br />영농일지 등을 체험해볼 수 있습니다.
      </p>
    </div>
  );
}

// ─── Timing helpers ───────────────────────────────────────────────────────────
const CS = 35;    // char speed ms
const MAX_T = 1000; // max typing ms
const SEND_P = 200; // send pause ms
const L = 350;    // loading delay
const R = 1400;   // response delay
const N = 600;    // gap between turns

function TD(text: string): number {
  return Math.min(text.length * CS, MAX_T);
}

// ─── Main ChatDemo ────────────────────────────────────────────────────────────
export function ChatDemo({ scenario, onBack }: ChatDemoProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFlow, setActiveFlow] = useState<ScenarioType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [srcType, setSrcType] = useState<"disease" | "subsidy">("disease");
  const [highlightedPanel, setHighlightedPanel] = useState<"camera" | "image" | "file" | null>(null);
  const [pendingImageType, setPendingImageType] = useState<"apple" | "strawberry-fruit" | "strawberry-leaf" | null>(null);
  const [subsidySelections, setSubsidySelections] = useState<(string | undefined)[]>([]);
  const [sourceBadgeHighlighted, setSourceBadgeHighlighted] = useState(false);
  const [farmingChoice, setFarmingChoice] = useState<"yes" | "no" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ts = getTimestamp();

  // helpers
  function clearAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setInputValue("");
    setHighlightedPanel(null);
    setPendingImageType(null);
    setSubsidySelections([]);
    setSourceBadgeHighlighted(false);
    setFarmingChoice(null);
  }

  function addMsg(msg: Omit<ChatMsg, "id" | "ts">) {
    setMessages(prev => [...prev, { ...msg, id: crypto.randomUUID(), ts }]);
  }

  function schedule(fn: () => void, delay: number) {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
  }

  // auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  function openSrc(type: "disease" | "subsidy") { setSrcType(type); setShowSources(true); }

  // ── Flow runner ─────────────────────────────────────────────────────────────
  function runSteps(steps: Step[]) {
    steps.forEach(step => {
      schedule(() => {
        if (step.kind === "loading-on") { setIsLoading(true); return; }
        if (step.kind === "loading-off") { setIsLoading(false); return; }
        if (step.kind === "user-text") {
          setInputValue("");
          addMsg({ kind: "user-text", text: step.text });
          return;
        }
        if (step.kind === "user-image") {
          setInputValue("");
          setPendingImageType(null);
          addMsg({ kind: "user-image", imageType: step.imageType, text: step.text });
          return;
        }
        if (step.kind === "ai") { addMsg({ kind: "ai", content: step.content }); return; }
        if (step.kind === "ai-subsidy") {
          addMsg({ kind: "ai-subsidy", subsidyStepIndex: step.stepIndex });
          return;
        }
        if (step.kind === "chip-select") {
          setSubsidySelections(prev => {
            const next = [...prev];
            next[step.stepIndex] = step.value;
            return next;
          });
          addMsg({ kind: "user-text", text: step.value });
          return;
        }
        if (step.kind === "panel-open") { setIsExpanded(true); return; }
        if (step.kind === "panel-close") { setIsExpanded(false); setHighlightedPanel(null); return; }
        if (step.kind === "panel-highlight") { setHighlightedPanel(step.option); return; }
        if (step.kind === "panel-image-preview") { setPendingImageType(step.imageType); return; }
        if (step.kind === "open-source-sheet") {
          setSourceBadgeHighlighted(true);
          const t2 = setTimeout(() => {
            setSourceBadgeHighlighted(false);
            openSrc(step.srcType);
          }, 700);
          timers.current.push(t2);
          return;
        }
        if (step.kind === "ai-apple-diagnosis") { addMsg({ kind: "ai-apple-diagnosis" }); return; }
        if (step.kind === "ai-strawberry-stage2") { addMsg({ kind: "ai-strawberry-stage2" }); return; }
        if (step.kind === "voice-open") { setShowVoice(true); return; }
        if (step.kind === "voice-close") { setShowVoice(false); return; }
        if (step.kind === "ai-farming-step1") { addMsg({ kind: "ai-farming-step1" }); return; }
        if (step.kind === "farming-choose") {
          setFarmingChoice(step.value);
          addMsg({ kind: "user-text", text: step.value === "yes" ? "네, 수요일로 조정할게요" : "아니오" });
          if (step.value === "yes") {
            schedule(() => setIsLoading(true), L);
            schedule(() => {
              setIsLoading(false);
              addMsg({ kind: "ai", content: <FarmingStep2Content /> });
            }, L + R);
          }
          return;
        }
        if (step.kind === "input-clear") { setInputValue(""); return; }
        if (step.kind === "input-type") {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          setInputValue("");
          const charDelay = step.duration / step.text.length;
          let i = 0;
          const interval = setInterval(() => {
            i++;
            setInputValue(step.text.slice(0, i));
            if (i >= step.text.length) {
              clearInterval(interval);
              typingIntervalRef.current = null;
            }
          }, charDelay);
          typingIntervalRef.current = interval;
          return;
        }
      }, step.at);
    });
  }

  function triggerFlow(id: ScenarioType) {
    clearAll();
    setIsLoading(false);
    setActiveFlow(id);

    if (id === "apple") {
      const TEXT2 = "증상이 다른거 같아. 사진을 보여줄게";

      let t = 0;
      const s: Step[] = [];

      // 첫 메시지 이미 있음, 바로 loading
      s.push({ at: t, kind: "loading-on" });
      t += R; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai", content: <AppleTextContent onSrc={() => openSrc("disease")} /> });
      t += N;

      // 두 번째 메시지: 패널 열기 → 하이라이트 → 닫기 → 이미지 프리뷰 → 타이핑 → 전송
      s.push({ at: t, kind: "panel-open" });
      t += 500;
      s.push({ at: t, kind: "panel-highlight", option: "image" });
      t += 600;
      s.push({ at: t, kind: "panel-close" });
      t += 300;
      s.push({ at: t, kind: "panel-image-preview", imageType: "apple" });
      t += 200;
      s.push({ at: t, kind: "input-type", text: TEXT2, duration: TD(TEXT2) });
      t += TD(TEXT2) + SEND_P;
      s.push({ at: t, kind: "user-image", imageType: "apple", text: TEXT2 });
      t += L; s.push({ at: t, kind: "loading-on" });
      t += R; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai-apple-diagnosis" });

      // 답변 출처 버튼 탭 플로우
      t += 1500;
      s.push({ at: t, kind: "open-source-sheet", srcType: "disease" });

      runSteps(s);
    }

    else if (id === "strawberry") {
      const TEXT1 = "최근에 비가 내린 후로 상태가 이상해졌어.";
      const TEXT2 = "추가 사진이에요. 더 확인해줘.";

      let t = 0;
      const s: Step[] = [];

      // 첫 번째 이미지: 홈 패널 완료 후 채팅 진입 → 이미지 프리뷰 바로 표시 → 타이핑 → 전송
      s.push({ at: t, kind: "panel-image-preview", imageType: "strawberry-fruit" });
      t += 200;
      s.push({ at: t, kind: "input-type", text: TEXT1, duration: TD(TEXT1) });
      t += TD(TEXT1) + SEND_P;
      s.push({ at: t, kind: "user-image", imageType: "strawberry-fruit", text: TEXT1 });
      t += L; s.push({ at: t, kind: "loading-on" });
      t += R; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai", content: <StrawberryStage1Content onSrc={() => openSrc("disease")} /> });
      t += N;

      // 두 번째 이미지: 패널 열기 → 하이라이트 → 닫기 → 이미지 프리뷰 → 타이핑 → 전송
      s.push({ at: t, kind: "panel-open" });
      t += 400;
      s.push({ at: t, kind: "panel-highlight", option: "image" });
      t += 500;
      s.push({ at: t, kind: "panel-close" });
      t += 200;
      s.push({ at: t, kind: "panel-image-preview", imageType: "strawberry-leaf" });
      t += 200;
      s.push({ at: t, kind: "input-type", text: TEXT2, duration: TD(TEXT2) });
      t += TD(TEXT2) + SEND_P;
      s.push({ at: t, kind: "user-image", imageType: "strawberry-leaf", text: TEXT2 });
      t += L; s.push({ at: t, kind: "loading-on" });
      t += R; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai-strawberry-stage2" });

      // 답변 출처 버튼 탭 플로우
      t += 1500;
      s.push({ at: t, kind: "open-source-sheet", srcType: "disease" });

      runSteps(s);
    }

    else if (id === "subsidy") {
      const SR = 900;
      let t = 0;
      const s: Step[] = [];

      // 첫 메시지 이미 있음, 바로 loading
      s.push({ at: t, kind: "loading-on" });
      t += SR; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai-subsidy", stepIndex: 0 }); // 지역 선택

      t += 1200; // 유저가 선택하는 시간
      s.push({ at: t, kind: "chip-select", stepIndex: 0, value: "충남" });

      t += 800;
      s.push({ at: t, kind: "loading-on" });
      t += SR; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai-subsidy", stepIndex: 1 }); // 분야 선택

      t += 1000;
      s.push({ at: t, kind: "chip-select", stepIndex: 1, value: "농업" });

      t += 700;
      s.push({ at: t, kind: "loading-on" });
      t += SR; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai-subsidy", stepIndex: 2 }); // 대상유형

      t += 1000;
      s.push({ at: t, kind: "chip-select", stepIndex: 2, value: "청년농업인" });

      t += 700;
      s.push({ at: t, kind: "loading-on" });
      t += SR; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai-subsidy", stepIndex: 3 }); // 신청 시기

      t += 1000;
      s.push({ at: t, kind: "chip-select", stepIndex: 3, value: "신청 예정" });

      t += 700;
      s.push({ at: t, kind: "loading-on" });
      t += SR; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai", content: <SubsidyResultContent onSrc={() => openSrc("subsidy")} /> });

      runSteps(s);
    }

    else if (id === "translation") {
      const SR = 1100;
      const TEXT2 = "그 과정 매뉴얼로 설명해줘";

      let t = 0;
      const s: Step[] = [];

      // 첫 메시지 이미 있음, 바로 loading
      s.push({ at: t, kind: "loading-on" });
      t += SR; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai", content: <TranslationStep1Content /> });
      t += 800;

      // 두 번째 메시지 타이핑
      s.push({ at: t, kind: "input-type", text: TEXT2, duration: TD(TEXT2) });
      t += TD(TEXT2) + SEND_P;
      s.push({ at: t, kind: "user-text", text: TEXT2 });
      t += L; s.push({ at: t, kind: "loading-on" });
      t += SR; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai", content: <TranslationStep2Content /> });

      runSteps(s);
    }

    else if (id === "farming") {
      let t = 0;
      const s: Step[] = [];

      // 첫 메시지는 홈 음성으로 이미 추가됨, 바로 loading
      s.push({ at: t, kind: "loading-on" });
      t += R; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai-farming-step1" });

      // 자동으로 "네" 선택
      t += 2200;
      s.push({ at: t, kind: "farming-choose", value: "yes" });

      runSteps(s);
    }

    else if (id === "faq") {
      let t = 0;
      const s: Step[] = [];

      // 첫 메시지 이미 있음, 바로 loading
      s.push({ at: t, kind: "loading-on" });
      t += R; s.push({ at: t, kind: "loading-off" });
      s.push({ at: t, kind: "ai", content: <FaqContent onVoice={() => setShowVoice(true)} /> });

      runSteps(s);
    }
  }

  function handleFarmingChoose(v: "yes" | "no") {
    if (farmingChoice !== null) return; // 이미 선택됨
    setFarmingChoice(v);
    addMsg({ kind: "user-text", text: v === "yes" ? "네, 수요일로 조정할게요" : "아니오" });
    if (v === "yes") {
      schedule(() => setIsLoading(true), L);
      schedule(() => {
        setIsLoading(false);
        addMsg({ kind: "ai", content: <FarmingStep2Content /> });
      }, L + R);
    }
  }

  function handleSend() {
    if (!inputValue.trim()) return;
    addMsg({ kind: "user-text", text: inputValue.trim() });
    setInputValue("");
  }

  // Mount 시 첫 메시지 즉시 추가 + flow 시작
  useEffect(() => {
    if (!scenario) return;

    // 첫 메시지 즉시 추가 (딸기 제외)
    const firstMsg = SCENARIO_FIRST_MESSAGES[scenario];
    if (firstMsg.kind === "text") {
      setMessages([{ id: crypto.randomUUID(), kind: "user-text", text: firstMsg.text, ts: getTimestamp() }]);
    } else if (firstMsg.kind === "image") {
      setMessages([{ id: crypto.randomUUID(), kind: "user-image", imageType: firstMsg.imageType, text: firstMsg.text, ts: getTimestamp() }]);
    } else {
      setMessages([]);
    }

    setActiveFlow(scenario);
    triggerFlow(scenario);

    return () => {
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // suppress unused var warning
  void activeFlow;

  return (
    <div
      className="bg-white relative overflow-hidden"
      style={{ width: 375, height: 812 }}
    >
      <ChatHeader onBack={onBack} />

      {/* Flex layout below header */}
      <div className="absolute left-0 right-0 bottom-0 flex flex-col" style={{ top: 70 }}>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-[16px] py-[16px]"
      >
        {messages.length === 0 && !isLoading && <EmptyState />}

        {messages.map((msg) => (
          <FadeIn key={msg.id} delay={0}>
            <div className={`mb-[20px] flex ${["ai", "ai-subsidy", "ai-apple-diagnosis", "ai-strawberry-stage2", "ai-farming-step1"].includes(msg.kind) ? "justify-start" : "justify-end"}`}>
              {msg.kind === "user-text" && (
                <UserMessageBubble message={msg.text!} timestamp={msg.ts} />
              )}
              {msg.kind === "user-image" && (
                <ImageMessageBubble imageType={msg.imageType!} text={msg.text} timestamp={msg.ts} />
              )}
              {msg.kind === "ai" && (
                <ChatContainer timestamp={msg.ts}>
                  <AIResponseHeader />
                  {msg.content}
                </ChatContainer>
              )}
              {msg.kind === "ai-subsidy" && (
                <ChatContainer timestamp={msg.ts}>
                  <AIResponseHeader />
                  {msg.subsidyStepIndex === 0 && <SubsidyStep1Content selected={subsidySelections[0]} />}
                  {msg.subsidyStepIndex === 1 && <SubsidyStep2Content selected={subsidySelections[1]} />}
                  {msg.subsidyStepIndex === 2 && <SubsidyStep3Content selected={subsidySelections[2]} />}
                  {msg.subsidyStepIndex === 3 && <SubsidyStep4Content selected={subsidySelections[3]} />}
                </ChatContainer>
              )}
              {msg.kind === "ai-apple-diagnosis" && (
                <ChatContainer timestamp={msg.ts}>
                  <AIResponseHeader />
                  <AppleDiagnosisContent onSrc={() => openSrc("disease")} sourceBadgeHighlighted={sourceBadgeHighlighted} />
                </ChatContainer>
              )}
              {msg.kind === "ai-strawberry-stage2" && (
                <ChatContainer timestamp={msg.ts}>
                  <AIResponseHeader />
                  <StrawberryStage2Content onSrc={() => openSrc("disease")} sourceBadgeHighlighted={sourceBadgeHighlighted} />
                </ChatContainer>
              )}
              {msg.kind === "ai-farming-step1" && (
                <ChatContainer timestamp={msg.ts}>
                  <AIResponseHeader />
                  <FarmingStep1Content farmingChoice={farmingChoice} onChoose={handleFarmingChoose} />
                </ChatContainer>
              )}
            </div>
          </FadeIn>
        ))}

        {isLoading && (
          <FadeIn delay={0}>
            <div className="flex justify-start mb-[20px]">
              <LoadingIndicator />
            </div>
          </FadeIn>
        )}
      </div>

      <BottomInput
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        onMicClick={() => setShowVoice(true)}
        highlightedOption={highlightedPanel}
        pendingImageType={pendingImageType}
      />
      </div>{/* end flex column */}

      {showVoice && <VoiceOverlay onClose={() => setShowVoice(false)} transcriptionText={inputValue || undefined} />}
      {showSources && <SourceSheet onClose={() => setShowSources(false)} type={srcType} />}
    </div>
  );
}
