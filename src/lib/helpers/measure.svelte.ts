type Dimension = number | null;

export const measure = () => {
    let ref: HTMLElement | null = null;

    const dimensions = $state<{
        height: Dimension;
        width: Dimension;
    }>({
        height: null,
        width: null
    });

    $effect(() => {
        if (!ref) return;

        const node = ref.getBoundingClientRect();
        dimensions.height = node.height;
        dimensions.width = node.width;
    });

    return {
        get ref() {
            return ref;
        },
        set ref(value) {
            ref = value;
        },
        dimensions
    };
};
