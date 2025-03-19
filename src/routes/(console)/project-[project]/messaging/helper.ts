import { MessagingProviderType, type Models } from '@appwrite.io/console';

export function getProviderText(type: MessagingProviderType | Models.Provider['type']): string {
    switch (type) {
        case MessagingProviderType.Email:
            return 'Email';
        case MessagingProviderType.Sms:
            return 'SMS';
        case MessagingProviderType.Push:
            return 'Push';
        default:
            return '';
    }
}
