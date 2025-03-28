import { timeFromNow } from '$lib/helpers/date';
import { timer } from '$lib/helpers/timeConversion';
import type { Column } from '$lib/helpers/types';
import { Framework, type Models } from '@appwrite.io/console';

import { writable } from 'svelte/store';

export function getEnumFromModel(model: Models.Framework): Framework {
    return Framework[model.name];
}

export const columns = writable<Column[]>([
    { id: 'name', title: 'Name', type: 'string', width: { min: 100 } },
    // { id: 'domains', title: 'Domains', type: 'string' },
    { id: 'deployed', title: 'Deployed', type: 'datetime', width: { min: 120 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } }
]);

export function generateSiteDeploymentDesc(site: Models.Site) {
    if (site.latestDeploymentStatus === 'building') {
        return `Deployment building ${timer(site.latestDeploymentCreatedAt)}`;
    } else {
        return `Deployed ${timeFromNow(site.deploymentCreatedAt)}`;
    }
}
