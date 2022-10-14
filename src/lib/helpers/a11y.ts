export function clickOnEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        (event.currentTarget as HTMLElement).click();
    }
}
