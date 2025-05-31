import Menu from './bottomSheetMenu.svelte';
import type { ComponentType } from 'svelte';

export type $$Props = {
    isOpen: boolean;
    useSlots?: boolean;
    sheetContainerRef?: HTMLDialogElement;
    showDivider?: boolean;
    menu: SheetMenu;
};
export type SubMenu = {
    title?: string;
    items: MenuItem[];
};

type MenuItem = {
    name: string;
    leadingIcon?: ComponentType;
    trailingIcon?: ComponentType;
    onClick?: () => void;
    href?: string;
    closeOnClick?: boolean;
    navigatePrevious?: boolean;
    checked?: boolean;
    subMenu?: { top: SubMenu; bottom: SubMenu };
};

export type SheetMenu = { top: SubMenu; bottom: SubMenu };

export default { Menu };
