'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  return (
    <>
      {/* CSS Media Queries for Desktop vs Mobile */}
      <style>{`
        .custom-footer-container {
          width: 100%;
          margin: 30px auto 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        /* Mobile View (Default) */
        .custom-red-box {
          width: 100%;
          max-width: 480px;
          background-color: #be0028;
          border: 2px solid #ffffff;
          border-radius: 12px;
          padding: 12px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        }

        .custom-nav-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          width: 100%;
          max-width: 480px;
        }

        /* Desktop View (Screen width 768px se badi hone par) */
        @media (min-width: 768px) {
          .custom-red-box {
            max-width: 800px; /* Desktop par box bada aur wide ho jayega */
            padding: 20px 30px;
            border-radius: 16px;
          }
          .desktop-domain {
            font-size: 26px !important;
          }
          .desktop-text {
            font-size: 18px !important;
          }
          .custom-nav-buttons {
            max-width: 800px;
            gap: 20px;
          }
          .custom-btn {
            font-size: 18px !important;
            padding: 12px 50px !important;
          }
        }
      `}</style>

      <footer className="custom-footer-container">
        {/* Red Main Admin & Copyright Box */}
        <div className="custom-red-box">
          <div style={styles.textGroup}>
            <div style={styles.domainText} className="desktop-domain">me.SATTA143.IN</div>
            <div style={styles.subText} className="desktop-text">ALL RIGHTS RESERVED</div>
            <div style={styles.subText} className="desktop-text">(2025-2026)</div>
            <div style={styles.adminText} className="desktop-text">CONTACT ADMIN</div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="custom-nav-buttons">
          <button 
            onClick={() => router.back()} 
            style={styles.backButton}
            className="custom-btn"
          >
            Back
          </button>

          <button 
            onClick={() => router.push('/')} 
            style={styles.homeButton}
            className="custom-btn"
          >
            Home
          </button>
        </div>
      </footer>
    </>
  );
}

// Base Styles
const styles = {
  textGroup: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: '1.3',
  },
  domainText: {
    fontSize: '18px',
    letterSpacing: '0.5px',
  },
  subText: {
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
  adminText: {
    fontSize: '16px',
    letterSpacing: '0.5px',
    marginTop: '4px',
  },
  backButton: {
    backgroundColor: '#f3e16b',
    color: '#000000',
    border: '1px solid #000000',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: '16px',
    padding: '8px 36px',
    cursor: 'pointer',
    clipPath: 'polygon(15% 50%, 15% 0%, 100% 0%, 100% 100%, 15% 100%)',
    flex: '1',
    maxWidth: '200px',
  },
  homeButton: {
    backgroundColor: '#ffb300',
    color: '#000000',
    border: '1px solid #000000',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: '16px',
    padding: '8px 36px',
    cursor: 'pointer',
    clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
    flex: '1',
    maxWidth: '200px',
  },
};
