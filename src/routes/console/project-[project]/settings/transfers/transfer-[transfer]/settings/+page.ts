import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.VARIABLES);

    const transfer = await sdkForProject.transfers.get(params.transfer);
    const source = async () => {
        try {
            return await sdkForProject.transfers.getSource(transfer.source);
        } catch (e) {
            return null;
        }
    };

    const destination = async () => {
        try {
            return await sdkForProject.transfers.getDestination(transfer.destination);
        } catch (e) {
            return null;
        }
    };

    return {
        transfer: transfer,
        source: await source(),
        destination: await destination()
    };
};
