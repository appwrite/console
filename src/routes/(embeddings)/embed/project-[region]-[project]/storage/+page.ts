import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url, params }) => {
    const { project } = await parent();
    
    // Import the console page loader to reuse the same logic
    const consoleLoader = await import('$routes/(console)/project-[region]-[project]/storage/+page.ts');
    
    // Call the console loader with the same parameters
    return await consoleLoader.load({ parent, url, params });
};