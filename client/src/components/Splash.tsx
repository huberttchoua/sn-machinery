import React from 'react';

const Splash: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-white flex items-center justify-center splash-overlay"
      style={{ zIndex: 2147483647 }}
    >
      <img src="/images/sn-machinery-logo.png" alt="SN MACHINERY" className="w-64 h-auto splash-logo" />
    </div>
  );
}

export default Splash;
