import React from "react";
import ReactDOM from "react-dom";

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CommentDialog: React.FC<CommentDialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-8 shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default CommentDialog; 