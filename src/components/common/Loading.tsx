import React from 'react';

/**
 * Global application-wide loading state for page transitions and data fetching.
 * Features a high-quality right-to-left alternating paw animation.
 * Optimized for minimal footprint: only displays during full-scale platform transitions.
 */
export const Loading: React.FC<{ fullScreen?: boolean; message?: string }> = ({ 
  fullScreen = true 
}) => {
  const containerStyle: React.CSSProperties = fullScreen 
    ? { 
        position: 'fixed', 
        inset: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#ffffff', 
        zIndex: 9999 
      }
    : { 
        padding: '80px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      };

  return (
    <div className="discovery-loading" style={containerStyle}>
      <div className="paw-trail-container">
        {/* Top Paw (Line 1) */}
        <div className="paw-wrapper p-top">
          <svg className="paw-icon" width="32" height="32" viewBox="0 0 24 24">
            <circle cx="12" cy="16" r="4.5" />
            <circle cx="6.5" cy="10.5" r="2.2"/>
            <circle cx="10" cy="7" r="2.4"/>
            <circle cx="14" cy="7" r="2.4"/>
            <circle cx="17.5" cy="10.5" r="2.2"/>
          </svg>
        </div>

        {/* Bottom Paw (Line 2) */}
        <div className="paw-wrapper p-bottom">
          <svg className="paw-icon" width="32" height="32" viewBox="0 0 24 24">
            <circle cx="12" cy="16" r="4.5" />
            <circle cx="6.5" cy="10.5" r="2.2"/>
            <circle cx="10" cy="7" r="2.4"/>
            <circle cx="14" cy="7" r="2.4"/>
            <circle cx="17.5" cy="10.5" r="2.2"/>
          </svg>
        </div>
      </div>

      <style>{`
        .paw-trail-container {
          position: relative;
          width: 120px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .paw-wrapper {
          position: absolute;
          opacity: 0;
          animation: moveLeft 1.6s infinite linear;
        }

        .p-top {
          top: 0;
        }

        .p-bottom {
          bottom: 0;
          animation-delay: 0.8s;
        }

        .paw-icon {
          fill: #2563eb; /* AniSell Brand Blue */
          filter: drop-shadow(0 2px 4px rgba(37, 99, 235, 0.1));
          /* Rotates paw to face the direction of travel (Left) */
          transform: rotate(90deg);
        }

        @keyframes moveLeft {
          0% {
            transform: translateX(60px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(-60px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
