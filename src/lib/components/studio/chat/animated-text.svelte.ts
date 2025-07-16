import { animate, motionValue } from 'motion';

export const animatedText = (text: string) => {
    const delimiter = "";
    const animatedCursor = motionValue(0);
    let cursor = $state<number>(0);
    let prevText = $state<string>(text);
    let isSameText = $state<boolean>(false);

    if (prevText !== text) {
        prevText = text;
        isSameText = text.startsWith(prevText);

        if (!text.startsWith(prevText)) {
            cursor = 0;
        }
    }

    $effect(() => {
        if (!isSameText) {
            animatedCursor.jump(0);
        }
        
        const controls = animate(animatedCursor, text.split(delimiter).length, {
            duration: 3,
            ease: 'easeOut',
            onUpdate: (latest) => {
                cursor = Math.floor(latest);
            }
        })

        return () => controls.stop();
    })


    return text.split(delimiter).slice(0, cursor).join(delimiter);
}