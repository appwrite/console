<script lang="ts">
    import { Remarkable } from 'remarkable';
    import Template from './template.svelte';
    import { Alert, Keyboard, Layout } from '@appwrite.io/pink-svelte';
    import { AvatarInitials, Code, LoadingDots, SvgIcon } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { page } from '$app/stores';
    import { organization } from '$lib/stores/organization';
    import { preferences } from '$lib/stores/preferences';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import { subPanels } from '../subPanels';
    import { isLanguage, type Language } from '$lib/components/code.svelte';
    import { tools, executeTool } from '$lib/assistant/tools';

    // ---------------------------------------------------------------------------
    // Markdown
    // ---------------------------------------------------------------------------
    const md = new Remarkable();

    // ---------------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------------
    type AnswerPart =
        | { type: 'text'; value: string }
        | { type: 'code'; language: Language; value: string };

    interface ToolCallEvent {
        toolCallId: string;
        name: string;
        args: Record<string, unknown>;
    }

    type AssistantContentPart =
        | { type: 'text'; text: string }
        | { type: 'tool-call'; toolCallId: string; toolName: string; args: Record<string, unknown> };

    type ToolResultPart = {
        type: 'tool-result';
        toolCallId: string;
        toolName: string;
        result: unknown;
    };

    type CoreMessage =
        | { role: 'user'; content: string }
        | { role: 'assistant'; content: string | AssistantContentPart[] }
        | { role: 'tool'; content: ToolResultPart[] };

    // ---------------------------------------------------------------------------
    // State (Svelte 5 runes)
    // ---------------------------------------------------------------------------
    let input = $state('');
    let history = $state<CoreMessage[]>([]);
    let streamingText = $state('');
    let isLoading = $state(false);
    let errorMsg = $state('');
    let pendingToolCall = $state<ToolCallEvent | null>(null);
    let awaitingApproval = $state(false);
    let feedback = $state<'positive' | 'negative' | null>(null);
    let traceId = $state('');
    let conversationEl = $state<HTMLElement | null>(null);

    // ---------------------------------------------------------------------------
    // Context injected with every request
    // ---------------------------------------------------------------------------
    const context = $derived({
        page: $page.url.pathname,
        projectId: ($page.params.project as string | undefined) ?? null,
        orgId: $organization?.$id ?? null,
        plan: ($organization as Record<string, unknown> | undefined)?.billingPlan ?? null,
        error: null as string | null,
    });

    // ---------------------------------------------------------------------------
    // Derived
    // ---------------------------------------------------------------------------
    const streamingParts = $derived(parseAnswer(streamingText));
    const showContent = $derived(
        isLoading || !!streamingText || awaitingApproval || history.length > 0,
    );

    // Auto-scroll when content changes
    $effect(() => {
        void streamingText;
        void history.length;
        conversationEl?.scrollTo({ top: conversationEl.scrollHeight });
    });

    // Auto-dispatch pending tool calls
    $effect(() => {
        if (pendingToolCall && !awaitingApproval && !isLoading) {
            const def = tools[pendingToolCall.name];
            if (def?.requiresApproval) {
                awaitingApproval = true;
            } else {
                handleToolCall(true);
            }
        }
    });

    // ---------------------------------------------------------------------------
    // Examples
    // ---------------------------------------------------------------------------
    const examples = [
        'How to add a custom domain in the console?',
        'How can I manage users, permissions, and access control in Appwrite?',
        'How can I set up database collections and documents?',
        'How do I configure and manage server-side functions in Appwrite?',
        'What is my current bandwidth usage?',
    ];

    // ---------------------------------------------------------------------------
    // Answer parsing — markdown + code blocks
    // ---------------------------------------------------------------------------
    function parseAnswer(text: string): AnswerPart[] | null {
        if (!text) return null;
        const parts: AnswerPart[] = [];
        const codeMatches = Array.from(text.matchAll(/```([a-z]*)(.*?)(```|$)/gs));
        let i = 0;
        let codeIdx = 0;
        while (i < text.length) {
            const next = codeMatches[codeIdx] ?? null;
            if (!next) {
                parts.push({ type: 'text', value: text.slice(i) });
                break;
            } else if (i >= next.index!) {
                let lang = next[1];
                if (lang === 'javascript') lang = 'js';
                parts.push({
                    type: 'code',
                    value: next[2].startsWith('\n') ? next[2].slice(1) : next[2],
                    language: isLanguage(lang) ? (lang as Language) : 'js',
                });
                i = next.index! + next[0].length;
                codeIdx++;
            } else {
                parts.push({ type: 'text', value: text.slice(i, next.index!) });
                i = next.index!;
            }
        }
        return parts;
    }

    function renderMarkdown(text: string): string {
        const trimmed = text
            .trim()
            .replace(/[ \t]+/g, ' ')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/\n+/g, '\n');

        const processed = trimmed
            .replace(
                /(\[(.*?)]\((.*?)\))|https?:\/\/\S+/g,
                (match, fullMarkdownLink) => (fullMarkdownLink ? match : `[${match}](${match})`),
            )
            .replace(/https?:\/\/\S+##/g, (url) => url.replace(/##/, '#'));

        const formatted = processed.replace(/(^|\n)Sources:/g, (_, p) => `${p}\nSources:`);
        let html = md.render(formatted);
        html = html.replace(/<a\s+href="([^"]+)"/g, '<a href="$1" target="_blank"');
        return html;
    }

    function getInitials(name: string): string {
        const [first, last] = name.split(' ');
        return `${first?.[0] ?? ''}${last?.[0] ?? ''}`;
    }

    /** Extract plain text from an assistant message content (for history display) */
    function assistantText(content: string | AssistantContentPart[]): string {
        if (typeof content === 'string') return content;
        return content
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join('');
    }

    /** Return tool call label if the assistant message is a tool-call step */
    function toolCallLabel(content: string | AssistantContentPart[]): string | null {
        if (typeof content === 'string') return null;
        const call = content.find((p): p is AssistantContentPart & { type: 'tool-call' } => p.type === 'tool-call');
        if (!call) return null;
        return tools[call.toolName]?.label ?? call.toolName;
    }

    // ---------------------------------------------------------------------------
    // SSE streaming
    // ---------------------------------------------------------------------------
    const endpoint = getApiEndpoint();

    async function sendMessages(messagesToSend: CoreMessage[]) {
        isLoading = true;
        errorMsg = '';
        streamingText = '';
        feedback = null;
        traceId = '';

        try {
            const res = await fetch(`${endpoint}/v1/console/assistant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-appwrite-project': 'console',
                },
                credentials: 'include',
                body: JSON.stringify({
                    messages: messagesToSend,
                    context,
                }),
            });

            if (!res.ok || !res.body) {
                throw new Error(`HTTP ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            outer: while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const sseChunks = buffer.split('\n\n');
                buffer = sseChunks.pop() ?? '';

                for (const chunk of sseChunks) {
                    if (!chunk.startsWith('data: ')) continue;
                    const raw = chunk.slice(6).trim();
                    if (!raw) continue;

                    let evt: Record<string, unknown>;
                    try {
                        evt = JSON.parse(raw);
                    } catch {
                        continue;
                    }

                    if (evt.event === 'text') {
                        streamingText += evt.text as string;
                    } else if (evt.event === 'tool_call') {
                        pendingToolCall = {
                            toolCallId: evt.toolCallId as string,
                            name: evt.name as string,
                            args: evt.args as Record<string, unknown>,
                        };
                        // Fix: clear isLoading so $effect can dispatch the tool
                        isLoading = false;
                        reader.cancel();
                        break outer;
                    } else if (evt.event === 'done') {
                        traceId = (evt.traceId as string) ?? '';
                        if (streamingText) {
                            history = [...history, { role: 'assistant', content: streamingText }];
                            streamingText = '';
                        }
                        isLoading = false;
                    } else if (evt.event === 'error') {
                        throw new Error((evt.message as string) ?? 'Unexpected error');
                    }
                }
            }
        } catch (err) {
            isLoading = false;
            errorMsg = err instanceof Error ? err.message : 'Unexpected error';
        }
    }

    // ---------------------------------------------------------------------------
    // Tool execution
    // ---------------------------------------------------------------------------
    async function handleToolCall(approved: boolean) {
        if (!pendingToolCall) return;
        const call = pendingToolCall;
        pendingToolCall = null;
        awaitingApproval = false;

        let toolResult: unknown;
        if (!approved) {
            toolResult = { cancelled: true };
        } else {
            try {
                toolResult = await executeTool(call.name, call.args);
            } catch (err) {
                toolResult = { error: err instanceof Error ? err.message : 'Tool failed' };
            }
        }

        const updatedHistory: CoreMessage[] = [
            ...history,
            {
                role: 'assistant',
                content: [
                    {
                        type: 'tool-call',
                        toolCallId: call.toolCallId,
                        toolName: call.name,
                        args: call.args,
                    },
                ],
            },
            {
                role: 'tool',
                content: [
                    {
                        type: 'tool-result',
                        toolCallId: call.toolCallId,
                        toolName: call.name,
                        result: toolResult,
                    },
                ],
            },
        ];
        history = updatedHistory;
        await sendMessages(history);
    }

    // ---------------------------------------------------------------------------
    // Submit
    // ---------------------------------------------------------------------------
    async function submit() {
        const prompt = input.trim();
        if (!prompt || isLoading) return;

        input = '';
        const userMessage: CoreMessage = { role: 'user', content: prompt };
        history = [...history, userMessage];
        await sendMessages(history);
    }

    // ---------------------------------------------------------------------------
    // New conversation
    // ---------------------------------------------------------------------------
    function newConversation() {
        history = [];
        streamingText = '';
        isLoading = false;
        errorMsg = '';
        pendingToolCall = null;
        awaitingApproval = false;
        feedback = null;
        traceId = '';
    }

    // ---------------------------------------------------------------------------
    // Feedback
    // ---------------------------------------------------------------------------
    function sendFeedback(score: 'positive' | 'negative') {
        if (!traceId) return;
        feedback = score;
        fetch(`${endpoint}/v1/console/assistant/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-appwrite-project': 'console',
            },
            credentials: 'include',
            body: JSON.stringify({ traceId, score: score === 'positive' ? 1 : 0 }),
        }).catch(() => {});
    }
</script>

<Template
    options={showContent
        ? undefined
        : examples.map((e) => ({
              label: e,
              callback: () => {
                  input = e;
                  submit();
              },
              group: 'Examples',
          }))}
    clearOnCallback={false}
    on:keydown={(e) => {
        if (e.detail.key === 'Enter' && input.trim()) {
            e.detail.cancel();
            return;
        }
        if (e.detail.key !== 'Escape' && showContent) {
            e.detail.cancel();
        }
    }}
    --min-height="40rem"
    --max-height="52.5rem">
    <div slot="search" class="u-flex u-cross-center u-gap-8">
        <span class="experimental border-gradient">EXPERIMENTAL</span>
        {#if history.length > 0}
            <button
                class="new-chat-btn"
                title="New conversation"
                on:click={newConversation}>
                <span class="icon-pencil-alt" aria-hidden="true"></span>
                <span class="u-sr-only">New conversation</span>
            </button>
        {/if}
    </div>

    <div slot="option" let:option class="u-flex u-cross-center u-gap-8">
        <i class="icon-question-mark-circle"></i>
        <span>{option.label}</span>
    </div>

    {#if !$preferences.hideAiDisclaimer}
        <div style="padding: 1rem; padding-block-end: 0;">
            <Alert.Inline
                dismissible
                title="We collect user responses to refine our experimental AI feature."
                on:dismiss={() => {
                    $preferences.hideAiDisclaimer = true;
                }} />
        </div>
    {/if}

    {#if showContent}
        <div class="conversation" bind:this={conversationEl}>
            <!-- Rendered history turns -->
            {#each history as msg, i (i)}
                {#if msg.role === 'user'}
                    <div class="turn turn-user">
                        <div class="avatar is-size-x-small">
                            {getInitials($user.name || $user.email)}
                        </div>
                        <p class="u-opacity-75">{msg.content}</p>
                    </div>
                {:else if msg.role === 'assistant'}
                    {@const label = toolCallLabel(msg.content)}
                    {@const text = assistantText(msg.content)}
                    <div class="turn turn-assistant">
                        <div class="logo">
                            <SvgIcon name="sparkles" type="color" />
                        </div>
                        <div class="answer">
                            {#if label}
                                <!-- Tool-call step: show compact indicator -->
                                <p class="tool-indicator">
                                    <span class="icon-cog" aria-hidden="true"></span>
                                    {label}
                                </p>
                            {:else if text}
                                {#each parseAnswer(text) ?? [] as part}
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
                                <!-- Feedback only on the last completed assistant message -->
                                {#if i === history.length - 1 && traceId}
                                    <div class="feedback u-flex u-gap-8 u-margin-block-start-16">
                                        <button
                                            class="feedback-btn"
                                            class:is-active={feedback === 'positive'}
                                            aria-label="Helpful"
                                            on:click={() => sendFeedback('positive')}>
                                            👍
                                        </button>
                                        <button
                                            class="feedback-btn"
                                            class:is-active={feedback === 'negative'}
                                            aria-label="Not helpful"
                                            on:click={() => sendFeedback('negative')}>
                                            👎
                                        </button>
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    </div>
                {/if}
                <!-- role === 'tool' is intentionally skipped -->
            {/each}

            <!-- In-progress assistant turn (streaming) -->
            {#if isLoading || streamingText || awaitingApproval}
                <div class="turn turn-assistant">
                    <div class="logo">
                        <SvgIcon name="sparkles" type="color" />
                    </div>
                    <div class="answer">
                        {#if awaitingApproval && pendingToolCall}
                            <!-- Write-tool approval gate -->
                            <div class="approval-gate">
                                <p class="u-bold">
                                    Confirm: {tools[pendingToolCall.name]?.label ??
                                        pendingToolCall.name}
                                </p>
                                <pre class="approval-args">{JSON.stringify(
                                        pendingToolCall.args,
                                        null,
                                        2,
                                    )}</pre>
                                <div class="u-flex u-gap-8 u-margin-block-start-16">
                                    <button
                                        class="button is-secondary is-small"
                                        on:click={() => handleToolCall(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        class="button is-small"
                                        on:click={() => handleToolCall(true)}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        {:else if isLoading && !streamingText}
                            <LoadingDots />
                        {:else if streamingParts}
                            {#each streamingParts as part}
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
            {/if}
        </div>
    {/if}

    {#if errorMsg}
        <div style="padding: 1rem; padding-block-end: 0;">
            <Alert.Inline status="error" title="Something went wrong">
                {errorMsg}
            </Alert.Inline>
        </div>
    {/if}

    <Layout.Stack slot="footer">
        <Layout.Stack gap="l">
            <Layout.Stack direction="row" gap="s">
                <AvatarInitials size="s" name={$user.name} />
                <form
                    class="u-full-width input-text-wrapper"
                    style="--amount-of-buttons: 1;"
                    style:display="flex"
                    style:width="100%"
                    style:align-items="center"
                    on:submit|preventDefault={submit}>
                    <!--  svelte-ignore a11y-autofocus -->
                    <input
                        type="text"
                        class="input-text"
                        style:width="100%"
                        placeholder="Ask a question or paste an error..."
                        autofocus
                        bind:value={input}
                        disabled={isLoading || awaitingApproval} />
                    <div class="options-list">
                        <button
                            class="options-list-button"
                            aria-label="ask AI"
                            type="submit"
                            disabled={!input.trim() || isLoading || awaitingApproval}>
                            <span class="icon-arrow-sm-right" aria-hidden="true"></span>
                        </button>
                    </div>
                </form>
            </Layout.Stack>
            <Layout.Stack direction="row" justifyContent="space-between" gap="xxl">
                <Layout.Stack direction="row" alignItems="center" gap="xxs">
                    <Keyboard key="Enter" autoWidth={true} /> <span>to search</span>
                </Layout.Stack>
                <Layout.Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap="xxs">
                    <Keyboard key="Esc" autoWidth={true} />
                    <span>to {$subPanels.length === 1 ? 'close' : 'go back'}</span>
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>
</Template>

<style lang="scss">
    :global(.theme-dark) .conversation {
        --logo-bg: #282a3b;
    }
    :global(.theme-light) .conversation {
        --logo-bg: #f2f2f8;
    }

    .conversation {
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .turn {
        display: flex;
        gap: 0.5rem;

        &-user {
            align-items: flex-start;

            .avatar {
                flex-shrink: 0;
            }

            p {
                padding-block-start: 0.125rem;
            }
        }

        &-assistant {
            align-items: flex-start;
        }
    }

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
        flex: 1;
        min-width: 0;

        p:first-of-type {
            white-space: pre-wrap;
        }
    }

    :global(.answer ul) {
        padding-inline-start: 1rem;
        list-style-type: disc;
        display: grid;
        gap: 1rem;
    }
    :global(.answer ol) {
        padding-inline-start: 1.1rem;
        list-style-type: decimal;
        display: grid;
        gap: 1rem;
    }
    :global(.answer a) {
        text-decoration: underline;
    }
    :global(.answer a:hover) {
        opacity: 0.8;
    }

    .tool-indicator {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        opacity: 0.6;
        font-style: italic;
    }

    .approval-gate {
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        background: var(--logo-bg);
    }

    .approval-args {
        margin-block-start: 0.5rem;
        font-size: 0.75rem;
        white-space: pre-wrap;
        word-break: break-all;
        opacity: 0.75;
    }

    .feedback {
        &-btn {
            background: none;
            border: none;
            cursor: pointer;
            opacity: 0.4;
            font-size: 1rem;
            transition: opacity 0.15s;
            padding: 0.25rem;

            &:hover,
            &.is-active {
                opacity: 1;
            }
        }
    }

    .new-chat-btn {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        opacity: 0.6;
        transition: opacity 0.15s;

        &:hover {
            opacity: 1;
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
        line-height: 150%;
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
