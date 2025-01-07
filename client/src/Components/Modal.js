import React from "react";
import "../Sass/Modal.scss";

function Modal({ isVisible, children }) {
  if (!isVisible) return null;

  return (
    <div className="Modal-Backdrop">
      <div className="Modal">
        <div className="Modal-Content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
