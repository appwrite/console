<script lang="ts">
    import { InputText } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { createDestination } from '../store';
    import FirebaseAuthflow from './FirebaseAuthflow.svelte';

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
                type: 'string',
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
                type: 'string',
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

    let firebaseFallback = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Provide Credentials</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please provide your authentication details for your provider.</svelte:fragment>
    {#if $createDestination.type === 'firebase' && !firebaseFallback}
        <FirebaseAuthflow />
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
                        Manually enter your account credentials.
                    </p>
                </span>
            </button>
        </div>
    {:else}
        <FormList>
            {#each Object.keys(credentialSchemas[$createDestination.type]) as key}
                <InputText
                    id={key}
                    label={credentialSchemas[$createDestination.type][key].label}
                    placeholder={credentialSchemas[$createDestination.type][key].placeholder}
                    bind:value={$createDestination.data[key]}
                    required={credentialSchemas[$createDestination.type][key].required} />
            {/each}
        </FormList>
    {/if}
</WizardStep>
