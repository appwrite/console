export function hasOnboardingDismissed(projectId: string) {
    const val = localStorage.getItem(`onboardingDismissed-${projectId}`) === 'true';
    console.log('val');
    return val;
}

export function setHasOnboardingDismissed(projectId: string) {
    localStorage.setItem(`onboardingDismissed-${projectId}`, 'true');
}
