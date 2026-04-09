import { useRef, useEffect } from "react";
import svgPaths from "../../imports/svg-rv1bmyf9dl";
import imgApple from "../../assets/apple-hand.png";
import imgStrawberryFruit from "../../assets/strawberry-fruit.png";
import imgStrawberryLeaf from "../../assets/strawberry-leaf.png";

const IMAGE_SRCS: Record<string, string> = {
  "apple": imgApple,
  "strawberry-fruit": imgStrawberryFruit,
  "strawberry-leaf": imgStrawberryLeaf,
};

function PlusIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="fe:plus">
          <path clipRule="evenodd" d={svgPaths.p179f7d00} fill="var(--fill-0, #999999)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function CloseIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path d="M18 6L6 18M6 6L18 18" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function MicIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="stash:mic">
          <path clipRule="evenodd" d={svgPaths.p35f08500} fill="var(--fill-0, #999999)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SendIcon() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[19.5px] top-1/2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5 19.5">
        <g id="solar:arrow-up-linear">
          <path d={svgPaths.p36313800} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.21875" />
        </g>
      </svg>
    </div>
  );
}

function SendButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div
      className={`${active ? 'bg-[#c9e331]' : 'bg-[#ddd]'} relative rounded-[812.5px] shrink-0 size-[26px] cursor-pointer hover:opacity-80 transition-colors`}
      onClick={onClick}
    >
      <SendIcon />
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M40 14H34L30 8H18L14 14H8C5.79086 14 4 15.7909 4 18V36C4 38.2091 5.79086 40 8 40H40C42.2091 40 44 38.2091 44 36V18C44 15.7909 42.2091 14 40 14Z" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 32C27.3137 32 30 29.3137 30 26C30 22.6863 27.3137 20 24 20C20.6863 20 18 22.6863 18 26C18 29.3137 20.6863 32 24 32Z" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="8" width="36" height="32" rx="2" stroke="#555555" strokeWidth="2"/>
      <path d="M6 32L16 22L22 28L30 20L42 32" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="15" cy="16" r="3" stroke="#555555" strokeWidth="2"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M28 6H12C9.79086 6 8 7.79086 8 10V38C8 40.2091 9.79086 42 12 42H36C38.2091 42 40 40.2091 40 38V18L28 6Z" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 6V18H40" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UploadOption({
  icon,
  label,
  highlighted,
}: {
  icon: JSX.Element;
  label: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-[8px] cursor-pointer hover:opacity-70 transition-opacity">
      <div
        className="flex items-center justify-center w-[64px] h-[64px] rounded-[16px] transition-colors"
        style={{
          background: highlighted ? "#3170e2" : "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        {highlighted ? (
          <div style={{ filter: "brightness(0) invert(1)" }}>{icon}</div>
        ) : (
          icon
        )}
      </div>
      <p
        style={{ fontFamily: "'Pretendard', sans-serif" }}
        className={`text-[12px] text-center font-medium ${highlighted ? "text-[#3170e2]" : "text-[#555]"}`}
      >
        {label}
      </p>
    </div>
  );
}

interface BottomInputProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSend?: () => void;
  onMicClick?: () => void;
  highlightedOption?: "camera" | "image" | "file" | null;
  pendingImageType?: "apple" | "strawberry-fruit" | "strawberry-leaf" | null;
}

export function BottomInput({
  isExpanded,
  onToggleExpanded,
  inputValue = "",
  onInputChange,
  onSend,
  onMicClick,
  highlightedOption,
  pendingImageType,
}: BottomInputProps) {
  const hasText = inputValue.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to ~3 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 72) + "px";
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onInputChange) {
      onInputChange(e.target.value);
    }
  };

  const handleSendClick = () => {
    if (hasText && onSend) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasText && onSend) onSend();
    }
  };

  return (
    <div className="bg-white content-stretch flex flex-col gap-[10px] items-center pb-[32px] pt-[16px] px-[16px] shadow-[0px_-2px_10px_0px_rgba(221,221,221,0.2)] w-full">
      {/* Upload Options - Shown when expanded */}
      {isExpanded && (
        <div
          className="w-full rounded-[16px] py-[20px] px-[16px] mb-[4px]"
          style={{ background: "#f5f5f5" }}
        >
          <div className="flex items-center justify-around gap-[16px]">
            <UploadOption
              icon={<CameraIcon />}
              label="사진 촬영"
              highlighted={highlightedOption === "camera"}
            />
            <UploadOption
              icon={<ImageIcon />}
              label="이미지"
              highlighted={highlightedOption === "image"}
            />
            <UploadOption
              icon={<FileIcon />}
              label="파일"
              highlighted={highlightedOption === "file"}
            />
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
        <div className="cursor-pointer" onClick={onToggleExpanded}>
          {isExpanded ? <CloseIcon /> : <PlusIcon />}
        </div>

        <div className="bg-[#f5f5f5] flex-[1_0_0] min-h-px min-w-px relative rounded-[100px]">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between pl-[12px] pr-[10px] py-[10px] relative w-full">
              {/* Pending image thumbnail */}
              {pendingImageType && (
                <div className="shrink-0 mr-[8px]">
                  <img
                    src={IMAGE_SRCS[pendingImageType]}
                    alt=""
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="질문을 입력해 보세요"
                className="font-['Pretendard:Regular',sans-serif] leading-[1.5] not-italic flex-1 bg-transparent outline-none text-[#222] placeholder:text-[#999] text-[14px] border-none resize-none overflow-hidden"
                style={{ minHeight: 20 }}
              />
              <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
                <div className="cursor-pointer" onClick={onMicClick}>
                  <MicIcon />
                </div>
                <SendButton active={hasText} onClick={handleSendClick} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Disclaimer */}
      <p className="font-['Pretendard:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#999] text-[12px] text-center w-full">AI가 생성한 답변이므로 중요한 내용은 한 번 더 확인해 주세요.</p>
    </div>
  );
}
