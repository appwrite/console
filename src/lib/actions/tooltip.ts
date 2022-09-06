import type { Action } from 'svelte/action';
import type { Props } from 'tippy.js';
import tippy from 'tippy.js';

export const tooltip: Action<HTMLElement, Partial<Props>> = (node, config) => {
    const instance = tippy(node, config);

    return {
        update({ content }) {
            if (content !== instance.props.content) {
                instance.setProps({
                    content
                });
            }
        },
        destroy() {
            instance.destroy();
        }
    };
};
