import { ImageIcon } from "lucide-react";

export function AuthPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-primary lg:block">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          transform: "rotate(45deg) scale(1.5)",
          transformOrigin: "center",
        }}
      />

      <div className="relative flex h-full min-h-screen items-center justify-center p-12">
        {/* Replace this block with your product image / mockup */}
        <div className="flex aspect-4/5 w-full max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-white/25 bg-white/10 text-primary-foreground shadow-2xl backdrop-blur-sm">
          <ImageIcon className="size-10 opacity-80" />
          <p className="text-sm font-medium">Image placeholder</p>
          <p className="max-w-[220px] text-center text-xs text-primary-foreground/70">
            Drop a marketing mockup here later
          </p>
        </div>
      </div>
    </aside>
  );
}
