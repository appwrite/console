import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const paymentMethods = derived(page, ($page) => $page.data.paymentMethods);

export const tierFree = {
    price: 0,
    name: 'Free',
    description: 'For personal, passion projects.'
};

export const tierPro = {
    price: 15,
    name: 'Pro',
    description: 'For pro developers and production projects that need the ability to scale.'
};
export const tierScale = {
    price: 685,
    name: 'Scale',
    description: 'For scaling teams that need dedicated support.'
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
