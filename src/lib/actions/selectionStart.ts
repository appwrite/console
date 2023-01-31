import { isNonNullable } from '$lib/helpers/type';
import type { Action } from 'svelte/action';

type Props = {
    onChange: (selectionStart: number) => void;
};

const init: Action<HTMLInputElement, Props> = (node, props) => {
    const { onChange } = props ?? {};

    const handler = () => {
        if (!isNonNullable(node.selectionStart)) return;
        onChange?.(node.selectionStart);
    };

    node.addEventListener('click', handler);
    node.addEventListener('keydown', handler);
    node.addEventListener('keyup', handler);
};

export const selectionStart: Action<HTMLInputElement, Props> = (node, props) => {
    init(node, props);

    return {
        update(props) {
            init(node, props);
        },
        destroy() {
            props?.onChange(-1);
        }
    };
};
