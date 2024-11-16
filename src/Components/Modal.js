import React from "react";
import "../Sass/Modal.scss";

function Modal({ isVisible, onClose, children }) {
  if (!isVisible) return null;

  return (
    <div className="Modal-Backdrop">
      <div className="Modal">
        <button className="Modal-Close" onClick={onClose}>
          &times;
        </button>
        <div className="Modal-Content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
