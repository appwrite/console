<script lang="ts">
    import Template from './template.svelte';

    import { Alert, AvatarInitials, Code, LoadingDots, SvgIcon } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { useCompletion } from 'ai/svelte';
    import { subPanels } from '../subPanels';

    import { isLanguage, type Language } from '$lib/components/code.svelte';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { VARS } from '$lib/system';

    const endpoint = VARS.APPWRITE_ENDPOINT ?? `${globalThis?.location?.origin}/v1`;

    const { input, handleSubmit, completion, isLoading, complete } = useCompletion({
        api: endpoint + '/console/assistant',
        headers: {
            'content-type': 'application/json'
        }
    });

    const examples = [
        'How to add platform in the console?',
        'How can I manage users, permissions, and access control in Appwrite?',
        'How can I set up database collections and documents in Appwrite?',
        'How do I configure and manage server-side functions in Appwrite?',
        'How to add custom domain in the console?'
    ];

    type Answer = Array<
        | {
              type: 'code';
              language: Language;
              value: string;
          }
        | {
              type: 'text';
              value: string;
          }
    >;

    function parseCompletion(c: string): Answer | null {
        if (!c) return null;
        const answer: Answer = [];

        // get all code matches
        const codeMatches = Array.from(c.matchAll(/```([a-z]*)(.*?)(```|$)/gs));

        let i = 0;
        let codeIdx = 0;
        while (i < c.length) {
            const nextCodeMatch = codeMatches[codeIdx] ?? null;
            if (!nextCodeMatch) {
                answer.push({
                    type: 'text',
                    value: c.slice(i)
                });
                break;
            } else if (i >= nextCodeMatch.index) {
                let language = nextCodeMatch[1];
                if (language === 'javascript') language = 'js';

                answer.push({
                    type: 'code',
                    value: nextCodeMatch[2].startsWith('\n')
                        ? nextCodeMatch[2].slice(1)
                        : nextCodeMatch[2],
                    language: isLanguage(language) ? language : 'js'
                });

                i = nextCodeMatch.index + nextCodeMatch[0].length;
                codeIdx++;
            } else {
                answer.push({
                    type: 'text',
                    value: c.slice(i, nextCodeMatch.index)
                });

                i = nextCodeMatch.index;
            }
        }

        return answer;
    }

    $: answer = parseCompletion($completion);

    function getInitials(name: string) {
        const [first, last] = name.split(' ');
        return `${first?.[0] ?? ''}${last?.[0] ?? ''}`;
    }
</script>

<Template
    options={$isLoading || answer
        ? undefined
        : examples.map((e) => {
              return {
                  label: e,
                  callback: () => {
                      $input = e;
                      complete($input);
                  },
                  group: 'Examples'
              };
          })}
    clearOnCallback={false}
    on:keydown={(e) => {
        if (e.detail.key !== 'Escape') {
            e.detail.cancel();
        }
    }}
    --min-height="40rem"
    --max-height="52.5rem">
    <div slot="search">
        <span class="experimental border-gradient">EXPERIMENTAL</span>
    </div>

    <div slot="option" let:option class="u-flex u-cross-center u-gap-8">
        <i class="icon-question-mark-circle" />
        <span>{option.label}</span>
    </div>

    {#if !$preferences.hideAiDisclaimer}
        <div style="padding: 1rem; padding-block-end: 0;">
            <Alert
                type="default"
                dismissible
                on:dismiss={() => {
                    $preferences.hideAiDisclaimer = true;
                }}>
                <span slot="title">
                    We collect user responses to refine our experimental AI feature.
                </span>
            </Alert>
        </div>
    {/if}

    {#if $isLoading || answer}
        <div class="content">
            <div class="u-flex u-gap-8 u-cross-center">
                <div class="avatar is-size-x-small">{getInitials($user.name)}</div>
                <p class="u-opacity-75">{$input}</p>
            </div>
            <div class="u-flex u-gap-8 u-margin-block-start-24">
                <div class="logo">
                    <SvgIcon name="sparkles" type="color" />
                </div>
                <div class="answer">
                    {#if $isLoading && !$completion}
                        <LoadingDots />
                    {:else}
                        {#each answer as part}
                            {#if part.type === 'text'}
                                <p>{part.value.trimStart()}</p>
                            {:else if part.type === 'code'}
                                {#key part.value}
                                    <div
                                        class="u-margin-block-start-8"
                                        style="margin-block-end: 1rem;">
                                        <Code language={part.language} code={part.value} noMargin />
                                    </div>
                                {/key}
                            {/if}
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    <div class="footer" slot="footer">
        <div class="u-flex u-cross-center u-gap-4">
            <AvatarInitials size={32} name={$user.name} />
            <form
                class="input-text-wrapper u-width-full-line"
                style="--amount-of-buttons: 1;"
                on:submit|preventDefault={handleSubmit}>
                <!--  svelte-ignore a11y-autofocus -->
                <input
                    type="text"
                    class="input-text"
                    placeholder="Ask a question..."
                    autofocus
                    bind:value={$input}
                    disabled={$isLoading} />
                <div class="options-list">
                    <button
                        class="options-list-button"
                        aria-label="ask AI"
                        type="submit"
                        disabled={!$input.trim() || $isLoading}>
                        <span class="icon-arrow-sm-right" aria-hidden="true" />
                    </button>
                </div>
            </form>
        </div>

        <div class="u-flex u-main-end u-cross-center u-gap-16 u-margin-block-start-16">
            <div class="u-flex u-cross-center u-gap-4">
                <kbd class="kbd">Enter</kbd>
                <span>to search</span>
            </div>
            <div class="sep" />
            <div class="u-flex u-cross-center u-gap-4">
                <kbd class="kbd">Esc</kbd>
                <span>to {$subPanels.length === 1 ? 'close' : 'go back'}</span>
            </div>
        </div>
    </div>
</Template>

<style lang="scss">
    :global(.theme-dark) .content {
        --logo-bg: #282a3b;
    }

    :global(.theme-light) .content {
        --logo-bg: #f2f2f8;
    }

    .content {
        overflow: auto;
        padding: 1rem;

        .logo {
            display: flex;
            width: 1.5rem;
            height: 1.5rem;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;

            border-radius: 0.25rem;
            background: var(--logo-bg);
        }

        .answer {
            overflow: hidden;

            p {
                white-space: pre-wrap;
            }
        }
    }

    .footer {
        .sep {
            width: 1px;
            height: 1.5rem;
            background-color: hsl(var(--color-neutral-150));
        }
    }

    .experimental {
        display: flex;
        padding: 0.09375rem 0.25rem;
        align-items: center;

        color: var(--light-neutrals-30, #e8e9f0);
        text-align: center;
        font-family: Inter;
        font-size: 0.625rem;
        font-style: normal;
        font-weight: 500;
        line-height: 150%; /* 0.9375rem */
        letter-spacing: 0.075rem;
        text-transform: uppercase;

        background: rgba(240, 46, 101, 0.24);
        --border-gradient: linear-gradient(
                to bottom,
                rgba(240, 46, 101, 0.48) 0%,
                rgba(240, 46, 101, 0) 150%
            )
            border-box;
        --border-size: 0.03rem;
        --border-radius: 0.25rem;
        border-radius: var(--border-radius);
    }

    :global(.theme-light) .experimental {
        color: rgba(240, 46, 101, 1);
    }
</style>
