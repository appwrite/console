import type { PageLoad } from './$types';

// Realtime tail data arrives over a websocket subscription opened in +page.svelte,
// so there is nothing to fetch here. This load only exists to keep the route convention.
export const load: PageLoad = async () => {
    return {};
};
