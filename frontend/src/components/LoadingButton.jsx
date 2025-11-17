import React from "react";
import "./LoadingButton.css";

export default function LoadingButton({ loading, children, ...props }) {
  return (
    <button
      {...props}
      className={`load-btn ${props.className}`}
      disabled={loading || props.disabled}
    >
      {loading ? (
        <div className="spinner"></div>
      ) : (
        children
      )}
    </button>
  );
}
