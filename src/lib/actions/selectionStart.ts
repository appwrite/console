import type { Action } from 'svelte/action';

type Props = {
    onChange: (selectionStart: number) => void;
};

export const selectionStart: Action<HTMLInputElement, Props> = (node, { onChange }) => {
    const handler = () => {
        onChange(node.selectionStart);
    };
    node.addEventListener('click', handler);
    node.addEventListener('keydown', handler);
    node.addEventListener('keyup', handler);

    return {
        update({ onChange }) {
            const handler = () => {
                onChange(node.selectionStart);
            };
            node.addEventListener('click', handler);
            node.addEventListener('keydown', handler);
            node.addEventListener('keyup', handler);
        },
        destroy() {
            onChange(-1);
        }
    };
};
