export function clickOnEnter(
    event: KeyboardEvent & {
        currentTarget: HTMLElement;
    }
) {
    if (event.key === 'Enter' && event.target === event.currentTarget) {
        event.preventDefault();
        event.currentTarget.click();
    }
}
