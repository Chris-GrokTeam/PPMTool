import Image from "next/image";

/** Corner branding on every screen. pointer-events-none so it does not block clicks. */
export function BrandMark() {
  return (
    <div
      className="pointer-events-none z-30 rounded-md bg-white/95 p-1.5 shadow-sm ring-1 ring-slate-200"
      style={{ position: "fixed", right: 16, bottom: 16, left: "auto", top: "auto" }}
      aria-hidden="true"
    >
      <Image
        src="/branding/jgs-logo.jpg"
        alt=""
        width={140}
        height={56}
        className="h-10 w-auto max-w-[10rem] object-contain"
      />
    </div>
  );
}
