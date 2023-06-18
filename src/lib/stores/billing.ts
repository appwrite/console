import type { Client, Payload } from '@appwrite.io/console';
import type { PaymentMethod } from '@stripe/stripe-js';

export class Billing {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async listPaymentMethods(teamId: string) {
        const path = `/teams/${teamId}/payment-methods`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('GET', uri);
    }

    async createPaymentMethod(teamId: string): Promise<PaymentMethod> {
        const path = `/teams/${teamId}/payment-methods`;
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

    async updatePaymentMethod(teamId: string, paymentMethodId: string, providerMethodId: string) {
        const path = `/teams/${teamId}/payment-methods/${paymentMethodId}`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'PUT',
            uri,
            { 'content-type': 'application/json' },
            {
                providerMethodId
            }
        );
    }

    async updateProjectPlan(projectId: string, billingPlan: string) {
        const path = `/project/${projectId}/plan`;
        const params: Payload = {
            billingPlan
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('patch', uri, { 'content-type': 'application/json' }, params);
    }

    async updateProjectBudget(projectId: string, budget: number, alertLimit: number) {
        const path = `/project/${projectId}/budget`;
        const params: Payload = {
            budget,
            alertLimit
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('patch', uri, { 'content-type': 'application/json' }, params);
    }
}

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
