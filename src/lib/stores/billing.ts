import type { Client } from '@appwrite.io/console';
import type { Organization } from './organization';
import type { PaymentMethod } from '@stripe/stripe-js';

export type PaymentMethodData = {
    $id: string;
    providerMethodId: string;
    expiryMonth: number;
    expiryYear: number;
    last4: string;
    country: string;
    brand: string;
};

export type PaymentList = {
    paymentMethods: PaymentMethodData[];
    total: number;
};

export class Billing {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async createOrganization(
        organizationId: string,
        name: string,
        billingPlan: string,
        paymentMethodId: string
    ): Promise<Organization> {
        const path = `/organizations`;
        const params = {
            organizationId,
            name,
            billingPlan,
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'POST',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getPlan(organizationId: string): Promise<string> {
        const path = `/organizations/${organizationId}/plan`;
        const params = {
            organizationId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async updatePlan(
        organizationId: string,
        billingPlan: string,
        paymentMethodId: string
    ): Promise<string> {
        const path = `/organizations/${organizationId}/plan`;
        const params = {
            organizationId,
            billingPlan,
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async updateBudget(organizationId: string, budget: number, alert: number[]): Promise<string> {
        const path = `/organizations/${organizationId}/budget`;
        const params = {
            organizationId,
            budget,
            alert
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async setOrganizationPaymentMethod(organizationId: string, paymentMethodId: string) {
        const path = `/organizations/${organizationId}/payment-method`;
        const params = {
            organizationId,
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async setOrganizationPaymentMethodBackup(organizationId: string, paymentMethodId: string) {
        const path = `/organizations/${organizationId}/payment-method/backup`;
        const params = {
            organizationId,
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async listInvoices(
        organizationId: string,
        queries: [] = [],
        search: string = ''
    ): Promise<string> {
        const path = `/organizations/${organizationId}/plan`;
        const params = {
            organizationId,
            queries,
            search
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getInvoice(organizationId: string, invoiceId: string) {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}`;
        const params = {
            organizationId,
            invoiceId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getInvoiceView(organizationId: string, invoiceId: string) {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}/view`;
        const params = {
            organizationId,
            invoiceId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async downloadInvoice(organizationId: string, invoiceId: string) {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}/download`;
        const params = {
            organizationId,
            invoiceId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    //ACCOUNT

    async listPaymentMethods(queries: [] = []): Promise<PaymentList> {
        const path = `/account/payment-methods`;
        const params = {
            queries
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'GET',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethodData> {
        const path = `/account/payment-methods/${paymentMethodId}`;
        const params = {
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'GET',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async createPaymentMethod(): Promise<PaymentMethod> {
        const path = `/account/payment-methods`;
        const params = {};
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'POST',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
    async updatePaymentMethod(
        paymentMethodId: string,
        providerMethodId: string
    ): Promise<PaymentMethodData> {
        const path = `/account/payment-methods/${paymentMethodId}`;
        const params = {
            paymentMethodId,
            providerMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async deletePaymentMethod(paymentMethodId: string): Promise<PaymentMethodData> {
        const path = `/account/payment-methods/${paymentMethodId}`;
        const params = {
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'delete',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
    async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethodData> {
        const path = `/account/payment-methods/${paymentMethodId}/default`;
        const params = {
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async addCredit(organizationId: string, couponId: string): Promise<PaymentMethodData> {
        const path = `/organizations/${organizationId}/credits`;
        const params = {
            couponId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'POST',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
    async listCredits(organizationId: string, queries = []): Promise<PaymentMethodData> {
        const path = `/organizations/${organizationId}/credits`;
        const params = {
            queries
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getCredit(organizationId: string, creditId: string): Promise<PaymentMethodData> {
        const path = `/organizations/${organizationId}/credits/${creditId}`;
        const params = {
            creditId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'GET',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    // async listPaymentMethods(teamId: string) {
    //     const path = `/teams/${teamId}/payment-methods`;
    //     const uri = new URL(this.client.config.endpoint + path);
    //     return await this.client.call('GET', uri);
    // }

    // async createPaymentMethod(teamId: string): Promise<PaymentMethod> {
    //     const path = `/teams/${teamId}/payment-methods`;
    //     const params = {};
    //     const uri = new URL(this.client.config.endpoint + path);
    //     return await this.client.call(
    //         'POST',
    //         uri,
    //         {
    //             'content-type': 'application/json'
    //         },
    //         params
    //     );
    // }
}

export const publicStripeKey = import.meta.env?.VITE_STRIPE_PUBLIC_KEY?.toString() as
    | string
    | undefined;

export const tierFree = {
    price: 0,
    name: 'Free',
    description: 'For personal, passion projects.'
};

export const tierStarter = {
    price: 10,
    name: 'Starter',
    description: 'For small organizations that want flexibility.'
};

export const tierPro = {
    price: 20,
    name: 'Pro',
    description: 'For organizations that need the ability scale easily.'
};

export const apperanceLight = {
    variables: {
        colorPrimary: '#606a7b',
        colorText: '#373B4D',
        colorBackground: '#FFFFFF',
        color: '#606a7b',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, arial, sans-serif',
        borderRadius: '4px'
    },
    rules: {
        '.Input:hover': {
            border: 'solid 1px #C4C6D7',
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: 'solid 1px #C4C6D7',
            boxShadow: 'none'
        },
        '.Input::placeholder': {
            color: '#C4C6D7'
        },
        '.Input--invalid': {
            border: 'solid 1px var(--colorDanger)',
            boxShadow: 'none'
        }
    }
};
export const apperanceDark = {
    variables: {
        colorPrimary: '#606a7b',
        colorText: '#C5C7D8',
        colorBackground: '#161622',
        colorDanger: '#FF453A',
        fontFamily: 'Inter, arial, sans-serif',
        borderRadius: '4px'
    },
    rules: {
        '.Input:hover': {
            border: 'solid 1px #4F5769',
            boxShadow: 'none'
        },
        '.Input:focus': {
            border: 'solid 1px #4F5769',
            boxShadow: 'none'
        },
        '.Input--invalid': {
            border: 'solid 1px var(--colorDanger)',
            boxShadow: 'none'
        }
    }
};
