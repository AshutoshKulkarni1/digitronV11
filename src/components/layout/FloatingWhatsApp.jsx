import siteConfig from "../../data/siteConfig";

export default function FloatingWhatsApp() {
  const waNumber = siteConfig.whatsappNumber || "917975782567";
  return (
    <a
      href={`https://wa.me/${waNumber}?text=Hi Digitron Associates, I would like to enquire about CCTV cameras and installation.`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="floating-wa-link"
    >
      <span className="ping" style={{ background: "#25D366" }}></span>
      <span className="floating-wa-circle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
          <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"></path>
          <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"></path>
        </svg>
      </span>
    </a>
  );
}
