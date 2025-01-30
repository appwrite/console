export function hasOnboardingDismissed(projectId: string) {
    return localStorage.getItem(`onboardingDismissed-${projectId}`) === 'true';
}

export function setHasOnboardingDismissed(projectId: string) {
    localStorage.setItem(`onboardingDismissed-${projectId}`, 'true');
}
