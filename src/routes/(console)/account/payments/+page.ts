import { redirect } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    if (!isCloud) redirect(302, '/');

    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ADDRESS);

    const [paymentMethods, addressList, countryList, locale] = await Promise.all([
        sdk.forConsole.account.listPaymentMethods(),
        sdk.forConsole.account.listBillingAddresses(),
        sdk.forConsole.locale.listCountries(),
        sdk.forConsole.locale.get()
    ]);

    return {
        paymentMethods,
        addressList,
        countryList,
        locale
    };
};
