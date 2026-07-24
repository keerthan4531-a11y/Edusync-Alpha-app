import React from "react";

export function GlobalSpinner() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .loader-ripple {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 80px;
        }
        .loader-ripple div {
            position: absolute;
            border: 4px solid #6366f1; /* indigo-500 */
            opacity: 1;
            border-radius: 50%;
            animation: loader-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
        .loader-ripple div:nth-child(2) {
            animation-delay: -0.5s;
        }
        @keyframes loader-ripple {
            0% { top: 36px; left: 36px; width: 0; height: 0; opacity: 0; }
            4.9% { top: 36px; left: 36px; width: 0; height: 0; opacity: 0; }
            50% { top: 0px; left: 0px; width: 72px; height: 72px; opacity: 1; }
            100% { top: 0px; left: 0px; width: 72px; height: 72px; opacity: 0; }
        }
      `}} />
      <div className="loader-ripple">
        <div></div>
        <div></div>
      </div>
    </>
  );
}
