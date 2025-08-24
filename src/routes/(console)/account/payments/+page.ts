import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ADDRESS);

    const [paymentMethods, addressList, countryList, locale] = await Promise.all([
        sdk.forConsole.billing.listPaymentMethods(),
        sdk.forConsole.billing.listAddresses(),
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
