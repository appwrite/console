export function getProjectId() {
    const pathname = window.location.pathname + '/';
    const projectMatch = pathname.match(/\/project-(.*?)\//);

    return projectMatch?.[1] || null;
}
