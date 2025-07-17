type Dimension = number | null;

export const measure = () => {
    const dimensions = $state<{
        width: Dimension;
        height: Dimension;
    }>({
        height: null,
        width: null
    });

    return {
        get dimensions() {
            return dimensions;
        }
    };
};
