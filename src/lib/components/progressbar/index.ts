export type ProgressbarData = {
    size: number;
    color: string;
    tooltip?: {
        title: string;
        label: string;
        // linkTitle?: string;
        // linkPath?: string;
    };
};

export type ProgressbarProps = {
    maxSize: number;
    data: Array<ProgressbarData>;
};

export { default as ProgressBar } from './ProgressBar.svelte';
