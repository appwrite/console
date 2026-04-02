import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { LayoutLoad } from './$types';
import type { Account } from '$lib/stores/user';
import { Dependencies } from '$lib/constants';
import { Platform, Query, type Models } from '@appwrite.io/console';
import { makePlansMap } from '$lib/helpers/billing';
import { plansInfo as plansInfoStore } from '$lib/stores/billing';
import { normalizeConsoleVariables } from '$lib/helpers/domains';
import { syncServerTime } from '$lib/helpers/fingerprint';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { isVerifyEmailRedirectError } from '$lib/helpers/emailVerification';

export const load: LayoutLoad = async ({ depends, parent, url }) => {
    const parentData = await parent();
    const { organizations, plansInfo } = parentData;
    const account = parentData.account as Account | undefined;

    const { endpoint, project } = sdk.forConsole.client.config;
    const verifyEmailUrl = resolve('/verify-email');

    // While unverified, several console APIs (not only teams) may return 401; avoid failing the layout.
    if (url.pathname === verifyEmailUrl && account && !account.emailVerification) {
        depends(Dependencies.RUNTIMES);
        depends(Dependencies.CONSOLE_VARIABLES);
        depends(Dependencies.ORGANIZATION);

        const [preferences, rawConsoleVariables, versionData] = await Promise.all([
            sdk.forConsole.account.getPrefs(),
            sdk.forConsole.console.variables().catch(() => ({}) as Models.ConsoleVariables),
            fetch(`${endpoint}/health/version`, {
                headers: { 'X-Appwrite-Project': project as string }
            })
                .then(async (response) => {
                    const dateHeader = response.headers.get('Date');
                    const parsed = dateHeader ? new Date(dateHeader).getTime() : NaN;
                    if (Number.isFinite(parsed)) {
                        syncServerTime(Math.floor(parsed / 1000));
                    }
                    return response.json() as { version?: string };
                })
                .catch(() => null)
        ]);

        const consoleVariables = normalizeConsoleVariables(rawConsoleVariables);

        plansInfoStore.set(plansInfo ?? null);

        return {
            roles: [],
            scopes: [],
            preferences,
            currentOrgId: undefined,
            organizations,
            consoleVariables,
            allProjectsCount: 0,
            plansInfo: plansInfo ?? null,
            version: versionData?.version ?? null
        };
    }

    depends(Dependencies.RUNTIMES);
    depends(Dependencies.CONSOLE_VARIABLES);
    depends(Dependencies.ORGANIZATION);

    const shouldRedirectToVerifyEmail = (error: unknown) =>
        isVerifyEmailRedirectError(error) && url.pathname !== verifyEmailUrl;

    const plansArrayPromise =
        plansInfo || !isCloud
            ? null
            : sdk.forConsole.console.getPlans({
                  platform: Platform.Appwrite
              });

    const [preferences, plansArray, versionData, rawConsoleVariables] = await Promise.all([
        sdk.forConsole.account.getPrefs(),
        plansArrayPromise,
        fetch(`${endpoint}/health/version`, {
            headers: { 'X-Appwrite-Project': project as string }
        }).then((response) => {
            const dateHeader = response.headers.get('Date');
            const parsed = dateHeader ? new Date(dateHeader).getTime() : NaN;
            if (Number.isFinite(parsed)) {
                syncServerTime(Math.floor(parsed / 1000));
            }
            return response.json() as { version?: string };
        }),
        sdk.forConsole.console.variables()
    ]).catch((error) => {
        if (shouldRedirectToVerifyEmail(error)) {
            redirect(303, verifyEmailUrl);
        }

        throw error;
    });

    const consoleVariables = normalizeConsoleVariables(rawConsoleVariables);

    let fallbackPlansInfoArray = plansInfo;
    if (!fallbackPlansInfoArray) {
        fallbackPlansInfoArray = makePlansMap(plansArray);
    }

    const currentOrgId =
        preferences.organization ??
        (organizations.teams.length > 0 ? organizations.teams[0].$id : undefined);

    // Load projects for the current organization if one is selected
    let projectsCount = 0;
    if (currentOrgId) {
        try {
            projectsCount = (
                await sdk.forConsole.projects.list({
                    queries: [
                        Query.equal('teamId', currentOrgId),
                        Query.limit(1),
                        Query.select(['$id'])
                    ]
                })
            ).total;
        } catch (e) {
            if (shouldRedirectToVerifyEmail(e)) {
                redirect(303, verifyEmailUrl);
            }

            projectsCount = 0;
        }
    }

    // just in case!
    plansInfoStore.set(fallbackPlansInfoArray);

    return {
        roles: [],
        scopes: [],
        preferences,
        currentOrgId,
        organizations,
        consoleVariables,
        allProjectsCount: projectsCount,
        plansInfo: fallbackPlansInfoArray,
        version: versionData?.version ?? null
    };
};
