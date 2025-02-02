import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import { useWindowSize } from '../hooks';

export type SidebarParam = {
  show?: boolean;
  direction?: 'left' | 'right';
  children: React.ReactNode;
  onClickBackground?: () => void;
  className?: string;
  width?: number | null;
};

export const Sidebar: React.FC<SidebarParam> = ({
  show,
  children,
  onClickBackground,
  direction = 'left',
  className,
  width = 320,
}) => {
  const windowSize = useWindowSize();

  return (
    <Drawer open={show ?? false} anchor={direction} onClose={onClickBackground}>
      <div
        className={
          className ? className : 'h-screen overflow-y-auto w-full bg-surface-container-low text-on-surface p-4'
        }
      >
        <div style={{ width: width ?? (windowSize.width > 1256 ? windowSize.width * 0.5 : windowSize.width * 0.9) }}>
          {children}
        </div>
      </div>
    </Drawer>
  );
};
