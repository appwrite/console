export const marketplace = [
    {
        icon: 'icon-lightning-bolt',
        id: 'starter',
        name: 'Starter function',
        tagline: 'A simple function. Create something awesome! 🚀',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/starter'
            },
            {
                name: 'php-8.0',
                commands: 'composer install',
                entrypoint: 'src/index.php',
                providerRootDirectory: 'php/starter'
            },
            {
                name: 'ruby-3.0',
                commands: 'bundle install',
                entrypoint: 'lib/main.rb',
                providerRootDirectory: 'ruby/starter'
            },
            {
                name: 'python-3.9',
                commands: 'pip install -r requirements.txt',
                entrypoint: 'src/main.py',
                providerRootDirectory: 'python/starter'
            },
            {
                name: 'dart-2.17',
                commands: 'dart pub get',
                entrypoint: 'lib/main.dart',
                providerRootDirectory: 'dart/starter'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/starter) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'APPWRITE_API_KEY',
                description: `The API Key to talk to Appwrite backend APIs. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/getting-started-for-server">Learn More</a>`,
                value: '',
                placeholder: 'd1efb...aec35',
                required: false
            }
        ]
    },
    {
        icon: 'icon-open-ai',
        id: 'prompt-chatgpt',
        name: 'Prompt ChatGPT',
        tagline: 'Ask question, and let OpenAI GPT-3.5-turbo answer.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/prompt-chatgpt'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/prompt-chatgpt) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'OPENAI_API_KEY',
                description: `A unique key used to authenticate with the OpenAI API. Please note that this is a paid service and you will be charged for each request made to the API. <a class="u-bold" target="_blank" href="https://platform.openai.com/docs/quickstart/add-your-api-key">Learn More</a>`,
                value: '',
                placeholder: 'sk-wzG...vcy',
                required: true
            },
            {
                name: 'OPENAI_MAX_TOKENS',
                description: `The maximum number of tokens that the OpenAI response should contain. Be aware that OpenAI models read and write a maximum number of tokens per API call, which varies depending on the model. For GPT-3.5-turbo, the limit is 4096 tokens. <a class="u-bold" target="_blank" href="https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them">Learn More</a>`,
                value: '512',
                placeholder: '512',
                required: false
            }
        ]
    },
    {
        icon: 'icon-perspective-api',
        id: 'analyze-with-perspectiveapi',
        name: 'Analyze with PerspectiveAPI',
        tagline: 'Automate moderation by getting toxicity of messages.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/analyze-with-perspectiveapi'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/analyze-with-perspectiveapi) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'PERSPECTIVE_API_KEY',
                description: `Google Perspective API key. It authenticates your function, allowing it to interact with the API. <a class="u-bold" target="_blank" href="https://developers.google.com/codelabs/setup-perspective-api">Learn More</a>`,
                value: '',
                placeholder: 'AIzaS...fk-fuM',
                required: true
            }
        ]
    },
    {
        icon: 'icon-pangea',
        id: 'censor-with-redact',
        name: 'Censor with Redact',
        tagline:
            'Cesnor sensitive information from a provided text string using Redact API by Pangea.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/censor-with-redact'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/censor-with-redact) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'PANGEA_REDACT_TOKEN',
                description: `Access token for the Pangea Redact API. <a class="u-bold" target="_blank" href="https://pangea.cloud/docs/redact/getting-started/configuration">Learn More</a>`,
                value: '',
                placeholder: 'pts_7p4...5wl4',
                required: true
            }
        ]
    },
    {
        icon: 'icon-document',
        id: 'generate-pdf',
        name: 'Generate PDF',
        tagline: 'Document containing sample invoice in PDF format.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/generate-pdf'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/generate-pdf) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: []
    },
    {
        icon: 'icon-discord',
        id: 'discord-command-bot',
        name: 'Discord command bot',
        tagline: 'Simple command using Discord Interactions.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install && npm run setup',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/discord-command-bot'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/discord-command-bot) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'DISCORD_PUBLIC_KEY',
                description: `Discord Public Key to verify request signature. <a class="u-bold" target="_blank" href="https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers#creating-an-app-on-discord">Learn More</a>`,
                value: '',
                placeholder: 'd1efb...aec35',
                required: true
            }
        ]
    },
    {
        icon: 'icon-github',
        id: 'github-issue-bot',
        name: 'GitHub issue bot',
        tagline:
            'Automate the process of responding to newly opened issues on a GitHub repository.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/github-issue-bot'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/github-issue-bot) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'GITHUB_TOKEN',
                description: `A personal access token from GitHub with the necessary permissions to post comments on issues. <a class="u-bold" target="_blank" href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token">Learn More</a>`,
                value: '',
                placeholder: 'ghp_1...',
                required: true
            },
            {
                name: 'GITHUB_WEBHOOK_SECRET',
                description: `The secret used to verify that the webhook request comes from GitHub. <a class="u-bold" target="_blank" href="https://docs.github.com/en/developers/webhooks-and-events/securing-your-webhooks">Learn More</a>`,
                value: '',
                placeholder: 'd1efb...aec35',
                required: true
            }
        ]
    },
    {
        icon: 'icon-bookmark',
        id: 'url-shortener',
        name: 'URL shortener',
        tagline: 'Generate URL with short ID and redirect to the original URL when visited.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/url-shortener'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/url-shortener) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'APPWRITE_API_KEY',
                description: `The API Key to talk to Appwrite backend APIs. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/getting-started-for-server">Learn More</a>`,
                value: '',
                placeholder: 'd1efb...aec35',
                required: true
            },
            {
                name: 'APPWRITE_ENDPOINT',
                description: `The URL endpoint of the Appwrite server. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/getting-started-for-server">Learn More</a>`,
                value: 'https://cloud.appwrite.io/v1',
                placeholder: 'https://cloud.appwrite.io/v1',
                required: false
            },
            {
                name: 'APPWRITE_DATABASE_ID',
                description: `The ID of the database to store the short URLs. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/databases">Learn More</a>`,
                value: 'urlShortener',
                placeholder: 'urlShortener',
                required: false
            },
            {
                name: 'APPWRITE_COLLECTION_ID',
                description: `The ID of the collection to store the short URLs. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/collections">Learn More</a>`,
                value: 'urls',
                placeholder: 'urls',
                required: false
            }
        ]
    },
    {
        icon: 'icon-algolia',
        id: 'sync-with-algolia',
        name: 'Sync with Algolia',
        tagline: 'Intuitive search bar for any data in Appwrite Databases.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/sync-with-algolia'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/sync-with-algolia) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'APPWRITE_API_KEY',
                description: `The API Key to talk to Appwrite backend APIs. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/getting-started-for-server">Learn More</a>`,
                value: '',
                placeholder: 'd1efb...aec35',
                required: true
            },
            {
                name: 'APPWRITE_DATABASE_ID',
                description: `The ID of the Appwrite database that contains the collection to sync. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/databases">Learn More</a>`,
                placeholder: '64a55...7b912',
                required: true
            },
            {
                name: 'APPWRITE_COLLECTION_ID',
                description: `The ID of the collection in the Appwrite database to sync. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/collections">Learn More</a>`,
                placeholder: '7c3e8...2a9f1',
                required: true
            },
            {
                name: 'ALGOLIA_ADMIN_API_KEY',
                description: `The admin API Key for your Algolia service. <a class="u-bold" target="_blank" href="https://www.algolia.com/doc/guides/security/api-keys/">Learn More</a>`,
                placeholder: 'fd0aa...136a8',
                required: true
            },
            {
                name: 'ALGOLIA_INDEX_ID',
                description: `The ID of the index in Algolia where the documents are to be synced. <a class="u-bold" target="_blank" href="https://www.algolia.com/doc/api-client/methods/indexing/">Learn More</a>`,
                placeholder: 'appwrite_index',
                required: true
            },
            {
                name: 'ALGOLIA_SEARCH_API_KEY',
                description: `The search API Key for your Algolia service. This key is used for searching the synced index. <a class="u-bold" target="_blank" href="https://www.algolia.com/doc/guides/security/api-keys/">Learn More</a>`,
                placeholder: 'bf2f5...df733',
                required: true
            },
            {
                name: 'APPWRITE_ENDPOINT',
                description: `The URL endpoint of the Appwrite server. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/getting-started-for-server">Learn More</a>`,
                value: 'https://cloud.appwrite.io/v1',
                placeholder: 'https://cloud.appwrite.io/v1',
                required: false
            }
        ]
    },
    {
        icon: 'icon-meilisearch',
        id: 'sync-with-meilisearch',
        name: 'Sync with Meilisearch',
        tagline: 'Intuitive search bar for any data in Appwrite Databases.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/sync-with-meilisearch'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/sync-with-meilisearch) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'APPWRITE_API_KEY',
                description: `The API Key to talk to Appwrite backend APIs. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/getting-started-for-server">Learn More</a>`,
                value: '',
                placeholder: 'd1efb...aec35',
                required: true
            },
            {
                name: 'APPWRITE_DATABASE_ID',
                description: `The ID of the Appwrite database that contains the collection to sync. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/databases">Learn More</a>`,
                placeholder: '64a55...7b912',
                required: true
            },
            {
                name: 'APPWRITE_COLLECTION_ID',
                description: `The ID of the collection in the Appwrite database to sync. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/collections">Learn More</a>`,
                placeholder: '7c3e8...2a9f1',
                required: true
            },
            {
                name: 'MEILISEARCH_ENDPOINT',
                description: `The host URL of the Meilisearch server. <a class="u-bold" target="_blank" href="https://www.meilisearch.com/docs/learn/getting_started/quick_start/">Learn More</a>`,
                placeholder: 'http://127.0.0.1:7700',
                required: true
            },
            {
                name: 'MEILISEARCH_ADMIN_API_KEY',
                description: `The admin API key for Meilisearch. <a class="u-bold" target="_blank" href="https://docs.meilisearch.com/reference/api/keys/">Learn More</a>`,
                placeholder: 'masterKey1234',
                required: true
            },
            {
                name: 'MEILISEARCH_SEARCH_API_KEY',
                description: `API Key for Meilisearch search operations. <a class="u-bold" target="_blank" href="https://www.algolia.com/doc/guides/security/api-keys/">Learn More</a>`,
                placeholder: 'searchKey1234',
                required: true
            },
            {
                name: 'MEILISEARCH_INDEX_NAME',
                description: `Name of the Meilisearch index to which the documents will be synchronized. <a class="u-bold" target="_blank" href="https://www.meilisearch.com/docs/learn/core_concepts/indexes/">Learn More</a>`,
                placeholder: 'appwrite_index',
                required: true
            },
            {
                name: 'APPWRITE_ENDPOINT',
                description: `The URL endpoint of the Appwrite server. <a class="u-bold" target="_blank" href="https://appwrite.io/docs/getting-started-for-server">Learn More</a>`,
                value: 'https://cloud.appwrite.io/v1',
                placeholder: 'https://cloud.appwrite.io/v1',
                required: false
            }
        ]
    },
    {
        icon: 'icon-vonage',
        id: 'whatsapp-with-vonage',
        name: 'WhatsApp with Vonage',
        tagline: 'Simple bot to answer WhatsApp messages.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/whatsapp-with-vonage'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/whatsapp-with-vonage) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'VONAGE_API_KEY',
                description: `API Key to use the Vonage API. <a class="u-bold" target="_blank" href="https://api.support.vonage.com/hc/en-us/articles/204014493-How-do-I-find-my-Voice-API-key-and-API-secret-">Learn More</a>`,
                value: '',
                placeholder: '62...97',
                required: true
            },
            {
                name: 'VONAGE_API_SECRET',
                description: `Secret to use the Vonage API. <a class="u-bold" target="_blank" href="https://api.support.vonage.com/hc/en-us/articles/204014493-How-do-I-find-my-Voice-API-key-and-API-secret-">Learn More</a>`,
                placeholder: 'Zjc...5PH',
                required: true
            },
            {
                name: 'VONAGE_API_SIGNATURE_SECRET',
                description: `Secret to verify the JWT token sent by Vonage. <a class="u-bold" target="_blank" href="https://developer.vonage.com/en/getting-started/concepts/signing-messages">Learn More</a>`,
                placeholder: 'NXOi3...IBHDa',
                required: true
            },
            {
                name: 'VONAGE_WHATSAPP_NUMBER',
                description: `Vonage WhatsApp number to send messages from. <a class="u-bold" target="_blank" href="https://api.support.vonage.com/hc/en-us/articles/4431993282580-Where-do-I-find-my-WhatsApp-Number-Certificate-">Learn More</a>`,
                placeholder: '+14000000102',
                required: true
            }
        ]
    },
    {
        icon: 'icon-bell',
        id: 'push-notification-with-fcm',
        name: 'Push Notification with FCM',
        tagline: 'Send push notifications to your users using Firebase Cloud Messaging (FCM).',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/push-notification-with-fcm'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/push-notification-with-fcm) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'FCM_PROJECT_ID',
                description: `A unique identifier for your FCM project. <a class="u-bold" target="_blank" href="https://firebase.google.com/docs/projects/learn-more#project-id">Learn More</a>`,
                value: '',
                placeholder: 'mywebapp-f6e57',
                required: true
            },
            {
                name: 'FCM_CLIENT_EMAIL',
                description: `Your FCM service account email. <a class="u-bold" target="_blank" href="https://github.com/appwrite/templates/tree/main/node/push-notification-with-fcm#:~:text=Documentation-,FCM%3A%20SDK%20Setup,-FCM_PRIVATE_KEY">Learn More</a>`,
                placeholder: 'fcm-adminsdk-2f0de@test-f7q57.iam.gserviceaccount.com',
                required: true
            },
            {
                name: 'FCM_PRIVATE_KEY',
                description: `A unique private key used to authenticate with FCM. <a class="u-bold" target="_blank" href="https://github.com/appwrite/templates/tree/main/node/push-notification-with-fcm#:~:text=Documentation-,FCM%3A%20SDK%20Setup,-FCM_DATABASE_URL">Learn More</a>`,
                placeholder: '0b683...75675',
                required: true
            },
            {
                name: 'FCM_DATABASE_URL',
                description: `URL of your FCM database. <a class="u-bold" target="_blank" href="https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments">Learn More</a>`,
                placeholder: 'https://my-app-f298e.firebaseio.com',
                required: true
            }
        ]
    },
    {
        icon: 'icon-mail',
        id: 'email-contact-form',
        name: 'Email Contact Form',
        tagline: 'Sends an email with the contents of a HTML form.',
        permissions: ['any'],
        events: [],
        cron: '',
        timeout: 15,
        usecases: ['placeholder'],
        runtimes: [
            {
                name: 'node-18.0',
                commands: 'npm install',
                entrypoint: 'src/main.js',
                providerRootDirectory: 'node/email-contact-form'
            }
        ],
        instructions: `For documentation and instructions check out [README.md](https://github.com/appwrite/templates/tree/main/node/email-contact-form) file.`,
        vcsProvider: 'github',
        providerRepositoryId: 'templates',
        providerOwner: 'appwrite',
        providerBranch: 'main',
        variables: [
            {
                name: 'SMTP_HOST',
                description: `The address of your SMTP server. Many STMP providers will provide this information in their documentation. Some popular providers include: Mailgun, SendGrid, and Gmail.`,
                value: '',
                placeholder: 'smtp.mailgun.org',
                required: true
            },
            {
                name: 'SMTP_PORT',
                description: `The port of your STMP server. Commnly used ports include 25, 465, and 587.`,
                placeholder: '25',
                required: true
            },
            {
                name: 'SMTP_USERNAME',
                description: `The username for your SMTP server. This is commonly your email address.`,
                placeholder: 'no-reply@mywebapp.org',
                required: true
            },
            {
                name: 'SMTP_PASSWORD',
                description: `The password for your SMTP server.`,
                placeholder: '5up3r5tr0ngP4ssw0rd',
                required: true
            },
            {
                name: 'SUBMIT_EMAIL',
                description: `The email address to send form submissions to.`,
                placeholder: 'me@mywebapp.org',
                required: true
            },
            {
                name: 'ALLOWED_ORIGINS',
                description: `An optional comma-separated list of allowed origins for CORS (defaults to *). This is an important security measure to prevent malicious users from abusing your function.`,
                value: '',
                placeholder: 'https://mywebapp.org,https://mywebapp.com',
                required: false
            }
        ]
    }
];

type Runtime = {
    name: string;
    commands: string;
    entrypoint: string;
    providerRootDirectory: string;
};

type Variable = {
    name: string;
    description: string;
    value?: string;
    placeholder: string;
    required: boolean;
};

export type MarketplaceTemplate = {
    icon: string;
    id: string;
    name: string;
    tagline: string;
    permissions: string[];
    events: string[];
    cron: string;
    timeout: number;
    usecases: string[];
    runtimes: Runtime[];
    instructions: string;
    vcsProvider: string;
    providerRepositoryId: string;
    providerOwner: string;
    providerBranch: string;
    variables: Variable[];
};

/*
Template:
    {
        "icon": "algolia",
        "id": "sync-with-algolia",
        "name": "Sync with Algolia",
        "tagline": "Search your Appwrite Database with Algolia.",
        "permissions": ["any"],
        "events": [ "users.*.create" ],
        "cron": "0 * * * *",
        "timeout": 15,
        "runtimes": [
            {
                "name": "node-18",
                "entrypoint": "src/main.js",
                "commands": "npm install"
            }
        ],
        "instructions": "# Some markdown stuff",
        "vcsProvider": "github",
        "vcsRepositoryName": "templates-for-node",
        "vcsOwnerName": "loks0n",
        "vcsRootDirectory": "sync-with-algolia",
        "variables": [
            {
                "name": "ALGOLIA_API_KEY",
                "description": "Algolia read-write API key.",
                "value": "",
                "placeholder": "sk_1df...h9jef",
                "required": true
            }
        ]
    }
*/
