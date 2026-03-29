"use client";

export function WhatsAppButton({ number, message }: { number: string; message?: string }) {
  if (!number) return null;

  const clean = number.replace(/\D/g, "");
  const text  = encodeURIComponent(message ?? "שלום, פניתי מהאתר ואשמח לקבל מידע נוסף");
  const href  = `https://wa.me/${clean}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שלח הודעת WhatsApp"
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
      style={{ background: "#25D366" }}
    >
      {/* WhatsApp SVG */}
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.627 4.64 1.813 6.653L2.667 29.333l6.88-1.773A13.285 13.285 0 0016.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 24c-2.16 0-4.267-.587-6.107-1.693l-.44-.267-4.08 1.053 1.08-3.96-.28-.453A10.61 10.61 0 015.333 16c0-5.88 4.787-10.667 10.667-10.667S26.667 10.12 26.667 16 21.88 26.667 16 26.667zm5.84-7.973c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16s-.827 1.04-1.013 1.253c-.187.213-.373.24-.693.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.613-.52-.533-.72-.547-.187-.013-.4-.013-.613-.013-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.453 4.827.76.333 1.36.533 1.827.68.773.24 1.48.2 2.04.12.62-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z"/>
      </svg>
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#25D366" }} />
    </a>
  );
}
