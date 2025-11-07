import { AnimatePresence, motion } from "framer-motion";
import { FiFileText, FiDownload, FiX } from "react-icons/fi";

const PdfModal = ({ isOpen, onClose, pdfUrl, title = "E-Vaccine Card" }) => {
  const tryDownload = async () => {
    try {
      const res = await fetch(pdfUrl, { mode: "cors" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "E-Vaccine-Card.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/35" onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl ring-1 ring-[#F04E36]/10 overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F04E36]/10 text-[#F04E36] hover:bg-[#F04E36]/20"
                aria-label="Close"
              >
                <FiX />
              </button>

              <div className="p-5 border-b border-[#081F2E]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 text-[#EAB308]">
                    <FiFileText />
                  </div>
                  <h3 className="text-lg font-semibold text-[#081F2E]">{title}</h3>
                </div>
                <button
                  onClick={tryDownload}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#081F2E] text-white px-3 py-2 text-sm hover:bg-[#0a1a28]"
                >
                  <FiDownload /> Download
                </button>
              </div>

              <div className="p-5">
                <div className="rounded-xl overflow-hidden ring-1 ring-[#081F2E]/10">
                  <iframe title="PDF Viewer" src={pdfUrl} className="w-full h-[520px] border-0" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PdfModal;