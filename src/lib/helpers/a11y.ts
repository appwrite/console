export function clickOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.target === event.currentTarget) {
        event.preventDefault();
        (event.currentTarget as HTMLElement).click();
    }
}
