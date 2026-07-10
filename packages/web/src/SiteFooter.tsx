import { useState } from "react";
import { PrivacyModal } from "./PrivacyModal";

/**
 * 網站左下角的署名與版本號。低調固定在角落,不干擾操作
 * (右下角是吉祥物,兩者分處左右)。版本字串在 build 時由 vite 注入。
 */
export function SiteFooter() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  return (
    <>
    <div className="pointer-events-none fixed bottom-2 left-3 z-10 select-none text-[11px] leading-tight text-ink-muted/70">
      <a
        className="pointer-events-auto font-bold underline-offset-2 transition hover:text-pal hover:underline"
        href="https://github.com/Dalufishe"
        target="_blank"
        rel="noreferrer"
      >
        由 Eason Lu (Dalufish) 用愛製作
      </a>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="font-mono opacity-80">{__APP_VERSION__}</span>
        <button
          className="pointer-events-auto underline-offset-2 transition hover:text-pal hover:underline"
          onClick={() => setShowPrivacy(true)}
        >
          隱私權政策
        </button>
      </div>
    </div>
    {/* modal 放在 footer 容器外,避免吃到 11px 字級與 select-none 的繼承。 */}
    {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  );
}
