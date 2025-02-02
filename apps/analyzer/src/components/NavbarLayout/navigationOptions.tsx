import HomeIcon from '@mui/icons-material/Home';
import type { NavButtonItem } from '@repo/material-ui';

export type NavigationOption = Omit<NavButtonItem, 'filter' | 'onClick'> & {
  link: string;
};

export const navigationOptions: NavigationOption[] = [
  {
    link: '/',
    title: 'Home',
    icon: <HomeIcon />,
  },
];
