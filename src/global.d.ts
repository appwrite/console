/// <reference types="@sveltejs/kit" />
interface Window {
    VERCEL_ANALYTICS_ID: string | false;
    SENTRY_DSN: string | false;
}

declare module 'prismjs/plugins/line-numbers/prism-line-numbers' {}
declare module 'prismjs/components/prism-dart' {}
declare module 'prismjs/components/prism-kotlin' {}
declare module 'prismjs/components/prism-json' {}
declare module 'prismjs/components/prism-bash' {}
declare module 'prismjs/components/prism-yaml' {}
declare module 'prismjs/components/prism-swift' {}
declare module 'prismjs/plugins/autoloader/prism-autoloader' {}
declare module 'prismjs/plugins/custom-class/prism-custom-class' {}
declare module '@analytics/google-analytics' {
    export default function googleAnalytics(options: any): any;
}
