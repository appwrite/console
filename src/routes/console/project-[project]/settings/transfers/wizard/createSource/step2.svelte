<script lang="ts">
    import { InputText } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputSecret from '$lib/elements/forms/inputSecret.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createSource } from '../store';
    import FirebaseAuthflow from './FirebaseAuthflow.svelte';

    // Scan the API AST for all the available credentials

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
                required: false,
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
                placeholder: 'example.supabase.co',
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
                required: false,
                value: 'postgres'
            },
            username: {
                type: 'string',
                label: 'Username',
                placeholder: 'postgres',
                required: false,
                value: 'postgres'
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
                type: 'string',
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
        if ($createSource.type) {
            Object.keys(credentialSchemas[$createSource.type]).forEach((key) => {
                if ($createSource.data[key]) {
                    return;
                }

                if (credentialSchemas[$createSource.type][key].value) {
                    $createSource.data[key] = credentialSchemas[$createSource.type][key].value;
                } else {
                    $createSource.data[key] = '';
                }
            });
        }
    });

    let firebaseFallback = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Provide Credentials</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please provide your authentication details for your provider.</svelte:fragment>
    {#if $createSource.type === 'firebase' && !firebaseFallback}
        <FirebaseAuthflow />
        <br />
        <div class="flex flex-row justify-center">
            <button
                class="tag tooltip"
                on:click|preventDefault={() => {
                    firebaseFallback = true;
                }}>
                <span class="icon-lock-closed" aria-hidden="true" />

                <span class="text">Manual Authentication</span>

                <span class="tooltip-popup" role="tooltip">
                    <p class="text u-margin-block-start-8">
                        Manually enter service account credentials.
                    </p>
                </span>
            </button>
        </div>
    {:else}
        <FormList>
            {#each Object.keys(credentialSchemas[$createSource.type]) as key}
                {#if credentialSchemas[$createSource.type][key].type === 'password'}
                    <InputSecret
                        id={key}
                        label={credentialSchemas[$createSource.type][key].label}
                        placeholder={credentialSchemas[$createSource.type][key].placeholder}
                        bind:value={$createSource.data[key]}
                        required={credentialSchemas[$createSource.type][key].required} />
                {:else}
                    <InputText
                        id={key}
                        label={credentialSchemas[$createSource.type][key].label}
                        placeholder={credentialSchemas[$createSource.type][key].placeholder}
                        bind:value={$createSource.data[key]}
                        required={credentialSchemas[$createSource.type][key].required} />
                {/if}
            {/each}
        </FormList>
    {/if}
</WizardStep>
