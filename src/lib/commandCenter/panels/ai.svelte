<script lang="ts">
    import { Remarkable } from 'remarkable';
    import Template from './template.svelte';
    import { Alert, Keyboard, Layout } from '@appwrite.io/pink-svelte';

    const markdownInstance = new Remarkable();

    import { AvatarInitials, Code, LoadingDots, SvgIcon } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { useCompletion } from 'ai/svelte';
    import { subPanels } from '../subPanels';

    import { isLanguage, type Language } from '$lib/components/code.svelte';
    import { preferences } from '$lib/stores/preferences';
    import { getApiEndpoint } from '$lib/stores/sdk';

    const endpoint = getApiEndpoint();
    const { input, handleSubmit, completion, isLoading, complete, error } = useCompletion({
        api: endpoint + '/console/assistant',
        headers: {
            'x-appwrite-project': 'console'
        },
        credentials: 'include'
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

    function renderMarkdown(answer: string): string {
        const trimmedAnswer = answer
            .trim()
            .replace(/[ \t]+/g, ' ')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/\n+/g, '\n');

        // targeting links in plain text.
        const processedAnswer = trimmedAnswer
            .replace(/(\[(.*?)]\((.*?)\))|https?:\/\/\S+/g, (match, fullMarkdownLink, _, __) =>
                fullMarkdownLink ? match : `[${match}](${match})`
            )
            .replace(/https?:\/\/\S+##/g, (url) => url.replace(/##/, '#'));

        const formattedAnswer = processedAnswer.replace(
            /(^|\n)Sources:/g,
            (_, prefix) => `${prefix}\nSources:`
        );

        let renderedHTML = markdownInstance.render(formattedAnswer);

        // add target blank to open links in a new tab.
        renderedHTML = renderedHTML.replace(/<a\s+href="([^"]+)"/g, '<a href="$1" target="_blank"');

        return renderedHTML;
    }

    function getInitials(name: string) {
        const [first, last] = name.split(' ');
        return `${first?.[0] ?? ''}${last?.[0] ?? ''}`;
    }

    let previousQuestion = '';
    $: if ($input) {
        previousQuestion = $input;
    }

    $: if (!$isLoading && answer) {
        // reset input if answer received.
        $input = '';
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
                <p class="u-opacity-75">{previousQuestion}</p>
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
                                <p>{@html renderMarkdown(part.value.trim())}</p>
                            {:else if part.type === 'code'}
                                {#key part.value}
                                    <div
                                        class="u-margin-block-start-8"
                                        style="margin-block-end: 1rem;">
                                        <Code
                                            label={part.language}
                                            language={part.language}
                                            code={part.value}
                                            noMargin
                                            noBoxPadding
                                            withCopy />
                                    </div>
                                {/key}
                            {/if}
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    {#if $error}
        <div style="padding: 1rem; padding-block-end: 0;">
            <Alert.Inline status="error" title="Something went wrong">
                An unexpected error occurred while handling your request. Please try again later.
            </Alert.Inline>
        </div>
    {/if}

    <Layout.Stack slot="footer">
        <Layout.Stack gap="l">
            <Layout.Stack direction="row" gap="s">
                <AvatarInitials size="s" name={$user.name} />
                <form
                    class="input-text-wrapper u-width-full-line"
                    style="--amount-of-buttons: 1;"
                    on:submit|preventDefault={(e) => {
                        handleSubmit(e);
                    }}>
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
            </Layout.Stack>
            <Layout.Stack direction="row" justifyContent="space-between" gap="xxl">
                <Layout.Stack direction="row" alignItems="center" gap="xxs">
                    <Keyboard key="Enter" autoWidth={true} /> <span>to search</span></Layout.Stack>
                <Layout.Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap="xxs">
                    <Keyboard key="Esc" autoWidth={true} />
                    <span>to {$subPanels.length === 1 ? 'close' : 'go back'}</span></Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>
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

            p:first-of-type {
                white-space: pre-wrap;
            }
        }

        :global(.answer ul),
        :global(.answer ol) {
            gap: 1rem;
            display: grid;
        }

        :global(.answer a) {
            text-decoration: underline;
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
