export const throttle = (fn: () => void, delay: number) => {
    let timeout = false;
    return () => {
        if (!timeout) {
            timeout = true;
            fn.apply(this);
            setTimeout(() => {
                timeout = false;
            }, delay);
        }
    };
};
