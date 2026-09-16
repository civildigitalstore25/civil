export const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/918807423228"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-[#22C55E] hover:bg-[#16a34a] text-white p-3.5 md:p-4 rounded-full shadow-2xl shadow-green-600/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
    >
      {/* WhatsApp Icon */}
      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
      </svg>
      {/* Subtle pulse ring around button */}
      <span className="absolute inset-0 rounded-full bg-[#22C55E] opacity-40 animate-ping pointer-events-none group-hover:hidden" />
    </a>
  );
};

export default WhatsAppButton;
