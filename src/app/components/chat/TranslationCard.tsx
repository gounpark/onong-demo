import { useState } from "react";

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5.5H4.5L8 2.5V13.5L4.5 10.5H2V5.5Z" fill="#3170e2" />
      <path d="M10.5 5.5C11.5 6.2 12 7.05 12 8C12 8.95 11.5 9.8 10.5 10.5" stroke="#3170e2" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M12 3.5C13.8 4.8 14.5 6.35 14.5 8C14.5 9.65 13.8 11.2 12 12.5" stroke="#3170e2" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="#3170e2" strokeWidth="1.3"/>
      <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="#3170e2" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

interface TranslationCardProps {
  targetLang: string;
  targetText: string;
  sourceText: string;
}

export function TranslationCard({ targetText, sourceText }: TranslationCardProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(targetText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSpeak = () => {
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 2000);
  };

  return (
    <div className="w-full rounded-[12px] border border-[#e8e8e8] bg-white overflow-hidden">
      <div className="flex flex-col gap-[12px] p-[14px]">
        {/* Speaker + 번역 텍스트 */}
        <div className="flex items-start gap-[10px]">
          <button onClick={handleSpeak} className={`mt-[3px] shrink-0 w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors ${speaking ? "bg-[#dce8ff]" : "bg-[#ebf1ff]"}`}>
            <SpeakerIcon />
          </button>
          <p style={{ fontFamily: "'Pretendard',sans-serif", fontWeight: 700, fontSize: 15, color: "#3170e2", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {targetText}
          </p>
        </div>
        {/* 구분선 */}
        <div className="h-px bg-[#f0f0f0]" />
        {/* 원문 */}
        <p style={{ fontFamily: "'Pretendard',sans-serif", fontWeight: 400, fontSize: 13, color: "#888", lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {sourceText}
        </p>
      </div>
      {/* 복사 footer */}
      <div className="border-t border-[#f0f0f0] px-[14px] py-[10px]">
        <button onClick={handleCopy} className="flex items-center gap-[6px]">
          <CopyIcon />
          <p style={{ fontFamily: "'Pretendard',sans-serif", fontWeight: 500, fontSize: 13, color: copied ? "#22c55e" : "#3170e2" }}>
            {copied ? "복사됨!" : "번역 내용 복사하기"}
          </p>
        </button>
      </div>
    </div>
  );
}
