import React from 'react';
import type { NavButtonParam } from '../NavButton';

export type NavButtonItem = {
  filter: boolean;
  title: NavButtonParam['title'];
  icon: NavButtonParam['icon'];
  onClick?: () => void;
};

export type NavbarParam<TOptions extends Record<string, NavButtonItem> = Record<string, NavButtonItem>> = {
  title: string;
  options: TOptions;
  logo?: React.ReactNode;
  selectedOption?: keyof TOptions;
};
