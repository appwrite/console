import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { preferences } from '$lib/stores/preferences';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import type { Organization } from '$lib/stores/organization';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.PROJECT);

    try {
        const project = await sdk.forConsole.projects.get(params.project);
        const prefs = await sdk.forConsole.account.getPrefs();
        const newPrefs = { ...prefs, organization: project.teamId };
        sdk.forConsole.account.updatePrefs(newPrefs);
        preferences.loadTeamPrefs(project.teamId);
        let roles = [];
        let scopes = [];
        if (isCloud) {
            const res = await sdk.forConsole.billing.getRoles(project.teamId);
            roles = res.roles;
            scopes = res.scopes;
            if (scopes.includes('billing.read')) {
                await failedInvoice.load(project.teamId);
            }
        }

        return {
            project,
            organization: await (sdk.forConsole.teams.get(project.teamId) as Promise<Organization>),
            roles,
            scopes
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
