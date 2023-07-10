<script lang="ts">
    import Template from './template.svelte';

    import { AvatarInitials, Code } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { useCompletion } from 'ai/svelte';
    import { subPanels } from '../subPanels';

    import CoolerAppwrite from '$lib/images/appwrite-cooler.svg';
    import { isLanguage, type Language } from '$lib/components/code.svelte';
    import { VARS } from '$lib/system';

    const { input, handleSubmit, completion, isLoading, complete } = useCompletion({
        api: VARS.ASSISTANT_ENDPOINT
    });

    const examples = [
        'How can I integrate Appwrite with my frontend application?',
        'How to add platform in the console?',
        'How can I manage users, permissions, and access control in Appwrite?',
        'How can I set up database collections and documents in Appwrite?',
        'How do I configure and manage server-side functions in Appwrite?',
        'How can I access the audit logs in the console?',
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
                    value: nextCodeMatch[2],
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
</script>

<Template fullheight>
    <div slot="search" />

    <div class="content">
        {#if $isLoading || answer}
            <div class="u-flex u-gap-8">
                <div class="logo">
                    <img src={CoolerAppwrite} alt="Appwrite logo" />
                </div>
                <div class="answer">
                    {#if $isLoading}
                        <p>...</p>
                    {:else}
                        {#each answer as part}
                            {#if part.type === 'text'}
                                <p>{part.value}</p>
                            {:else if part.type === 'code'}
                                <Code language={part.language} code={part.value} />
                            {/if}
                        {/each}
                    {/if}
                </div>
            </div>
        {:else}
            <h2 class="eyebrow-heading-3">Examples</h2>
            <ul class="examples">
                {#each examples as example}
                    <li>
                        <button
                            class="u-flex u-cross-center u-gap-8"
                            on:click={() => {
                                $input = example;
                                complete($input);
                            }}>
                            <i class="icon-question-mark-circle" />
                            <span>{example}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>

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
    .content {
        overflow-y: auto;
        padding: 1rem;

        .logo {
            display: flex;
            width: 1.5rem;
            height: 1.5rem;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;

            border-radius: 0.25rem;
            background: #282a3b;
        }

        .answer {
            overflow: hidden;

            p {
                white-space: pre-wrap;
            }
        }

        h2 {
            color: hsl(var(--color-neutral-70));
        }

        .examples {
            display: flex;
            flex-direction: column;

            li {
                padding: 0.59375rem 0.5rem;

                button {
                    &:hover {
                        opacity: 0.75;
                    }

                    i {
                        color: hsl(var(--color-neutral-70));
                    }
                }
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
</style>
