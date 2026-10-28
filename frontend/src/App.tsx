import React from 'react';
import { OverlayHUD } from './components/overlay/OverlayHUD';

export const App: React.FC = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent select-text">
      <OverlayHUD />
    </div>
  );
};
