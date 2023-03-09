// Svelte action that truncates innerText to a max n characters. If truncate is then set to false, the full text is shown.
// Usage: <div use:truncate={n}></div>

import type { Action } from 'svelte/action';

type TruncateArgs = {
    n: number;
    enabled?: boolean;
};

export const truncate: Action<HTMLElement, TruncateArgs> = (node, props) => {
    const initialText = node.innerText;

    function truncate({ enabled, n }: TruncateArgs) {
        if (enabled === false) {
            node.innerText = initialText;
        } else {
            node.innerText =
                initialText.slice(0, n / 2) +
                '...' +
                initialText.slice(initialText.length - n / 2, initialText.length);
        }
    }

    truncate(props);
    return {
        update: truncate
    };
};
