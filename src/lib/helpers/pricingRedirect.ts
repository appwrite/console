import { goto } from '$app/navigation';
import { base } from '$app/paths';

export function checkPricingRefAndRedirect(searchParams: URLSearchParams, shouldRegister = false) {
    if (searchParams.has('type')) {
        const paramType = searchParams.get('type');
        const hasPlan = searchParams.has('plan');
        if (paramType === 'create') {
            shouldRegister
                ? goto(
                      `${base}/register?type=create${hasPlan ? `&plan=${searchParams.get('plan')}` : ''}`
                  )
                : goto(
                      `${base}/create-organization?type=create${hasPlan ? `&plan=${searchParams.get('plan')}` : ''}`
                  );
        }
        //Legacy
        if (paramType === 'createPro') {
            shouldRegister
                ? goto(`${base}/register?type=create&plan=tier-1`)
                : goto(`${base}/create-organization?type=create&plan=tier-1`);
        }
    }
}
