import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "../Components/GoogleButton";
import "../Sass/Modal.scss";

function Modal({ isVisible, onClose, children }) {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess:(response) => {
      console.log(response)
    },
    onError: (error) => {
      console.log(error)
    }
  })

  if (!isVisible) return null;

  return (
    <div className="Modal-Backdrop">
      <div className="Modal">
        <button className="Modal-Close" onClick={onClose}>
          &times;
        </button>
        <div className="Modal-Content">{children}</div>
        <GoogleButton onClick={handleGoogleLogin} />
      </div>
    </div>
  );
}

export default Modal;
