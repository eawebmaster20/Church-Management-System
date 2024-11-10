import { MenuItem } from "../sidebar/menu.model";

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENU',
        isTitle: true
    },
    {
        id: 2,
        label: 'dashboard',
        icon: 'bx-home-circle',
        link: '/'
    },
    {
        id: 10,
        label: 'calendar',
        icon: 'bx-calendar',
        link: '/calender',
    },
    {
        id: 49,
        label: 'register',
        icon: 'bxs-user-detail',
        link: '/form',
    },
];

