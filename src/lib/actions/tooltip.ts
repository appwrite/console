import type { Action } from 'svelte/action';
import type { Props as TippyProps } from 'tippy.js';
import tippy from 'tippy.js';

type Props = TippyProps & {
    disabled?: boolean;
};

export const tooltip: Action<HTMLElement, Partial<Props>> = (node, config) => {
    const instance = tippy(node, config);
    if (config.disabled) instance.disable();

    return {
        update({ content, disabled }) {
            if (content !== instance.props.content) {
                instance.setProps({
                    content
                });
            }

            disabled ? instance.disable() : instance.enable();
        },
        destroy() {
            instance.destroy();
        }
    };
};
