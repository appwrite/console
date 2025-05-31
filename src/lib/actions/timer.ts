import { calculateTime } from '$lib/helpers/timeConversion';
import type { Action } from 'svelte/action';

type Props = {
    start?: string;
    enabled?: boolean;
};

const defaultProps: Props = {
    enabled: true
};

export const timer: Action<HTMLElement, Props> = (node, props) => {
    let startDate: Date;
    let frame: number;

    function init(props: Props) {
        const { start, enabled } = { ...defaultProps, ...props };
        startDate = start ? new Date(start) : new Date();
        frame = enabled ? window.requestAnimationFrame(step) : null;
    }

    function step() {
        const diffInSeconds = Math.floor((new Date().getTime() - startDate.getTime()) / 1000);
        const minutes = Math.floor(diffInSeconds / 60);
        if (minutes > 0) {
            const seconds = diffInSeconds % 60;
            node.textContent = `${minutes}m ${seconds}s`;
        } else {
            node.textContent = calculateTime(diffInSeconds);
        }
        frame = window.requestAnimationFrame(step);
    }

    init(props);

    return {
        update(props) {
            window.cancelAnimationFrame(frame);
            init(props);
        },
        destroy() {
            window.cancelAnimationFrame(frame);
        }
    };
};
