import { goto } from '$app/navigation';
import { base } from '$app/paths';

export function checkPricingRefAndRedirect(searchParams: URLSearchParams, shouldRegister = false) {
    if (searchParams.has('type')) {
        const paramType = searchParams.get('type');
        if (paramType === 'createPro') {
            shouldRegister
                ? goto(`${base}/register?type=createPro`)
                : goto(`${base}/create-organization?type=createPro`);
        }
    }
}
