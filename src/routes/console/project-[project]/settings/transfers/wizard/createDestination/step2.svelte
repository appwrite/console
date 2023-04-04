<script lang="ts">
    import { InputText } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputSecret from '$lib/elements/forms/inputSecret.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createDestination } from '../store';

    /**
     * @type {Record<string, Record<string, { type: string; label: string; placeholder: string; required: boolean; value?: string; }>>}
     */
    let credentialSchemas = {
        nhost: {
            host: {
                type: 'string',
                label: 'Host',
                placeholder: 'example.db.eu-central-1.nhost.run',
                required: true,
                value: ''
            },
            port: {
                type: 'number',
                label: 'Port',
                placeholder: '5432',
                required: true,
                value: '5432'
            },
            database: {
                type: 'string',
                label: 'Database',
                placeholder: 'postgres',
                required: true,
                value: 'postgres'
            },
            username: {
                type: 'string',
                label: 'Username',
                placeholder: 'postgres',
                required: true,
                value: 'postgres'
            },
            password: {
                type: 'password',
                label: 'Password',
                placeholder: 'password',
                required: true,
                value: ''
            }
        },
        supabase: {
            host: {
                type: 'string',
                label: 'Host',
                placeholder: 'db.example.supabase.co',
                required: true
            },
            port: {
                type: 'number',
                label: 'Port',
                placeholder: '5432',
                required: false,
                value: '5432'
            },
            database: {
                type: 'string',
                label: 'Database',
                placeholder: 'postgres',
                required: true
            },
            username: {
                type: 'string',
                label: 'Username',
                placeholder: 'postgres',
                required: true
            },
            password: {
                type: 'password',
                label: 'Password',
                placeholder: 'password',
                required: true
            }
        },
        appwrite: {
            endpoint: {
                type: 'string',
                label: 'Endpoint',
                placeholder: 'https://cloud.appwrite.io/v1',
                required: true
            },
            project: {
                type: 'string',
                label: 'Project',
                placeholder: 'Project ID',
                required: true
            },
            key: {
                type: 'password',
                label: 'Key',
                placeholder: 'API Key',
                required: true
            }
        },
        firebase: {
            'account-credentials': {
                type: 'file',
                label: 'Account Credentials',
                placeholder: '{type: "service_account", ...}',
                required: true
            }
        }
    };

    onMount(() => {
        if ($createDestination.type) {
            Object.keys(credentialSchemas[$createDestination.type]).forEach((key) => {
                if ($createDestination.data[key]) {
                    return;
                }

                if (credentialSchemas[$createDestination.type][key].value) {
                    $createDestination.data[key] =
                        credentialSchemas[$createDestination.type][key].value;
                } else {
                    $createDestination.data[key] = '';
                }
            });
        }
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Provide Credentials</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please provide your authentication details for your provider.</svelte:fragment>
    <FormList>
        {#each Object.keys(credentialSchemas[$createDestination.type]) as key}
            {#if credentialSchemas[$createDestination.type][key].type === 'password'}
                <InputSecret
                    id={key}
                    label={credentialSchemas[$createDestination.type][key].label}
                    placeholder={credentialSchemas[$createDestination.type][key].placeholder}
                    bind:value={$createDestination.data[key]}
                    required={credentialSchemas[$createDestination.type][key].required} />
            {:else}
                <InputText
                    id={key}
                    label={credentialSchemas[$createDestination.type][key].label}
                    placeholder={credentialSchemas[$createDestination.type][key].placeholder}
                    bind:value={$createDestination.data[key]}
                    required={credentialSchemas[$createDestination.type][key].required} />
            {/if}
        {/each}
    </FormList>
</WizardStep>
