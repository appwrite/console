import type { Translation } from '../i18n-types';

const de: Translation = {
    globals: {
        placeholders: {
            email: 'E-Mail',
            password: 'Passwort',
            enter_password: 'Passwort eingeben',
            confirm_password: 'Passwort bestätigen',
            your_name: 'Ihr Name',
            your_email: 'Ihre E-Mail-Adresse',
            your_password: 'Ihr Passwort',
            your_code: 'dein Code'
        },
        update: 'aktualisieren',
        recover: 'genesen',
        accept: 'akzeptieren',
        cancel: 'stornieren'
    },
    login: {
        title: 'anmelden',
        field_inputs: {
            email: 'E-Mail',
            password: 'Passwort'
        }
    },
    sign_up: {
        title: 'Anmeldung',
        field_inputs: {
            name: 'Name',
            email: 'E-Mail',
            password: 'Passwort',
            code: 'Code'
        },
        already_registered: 'Sie haben bereits ein Konto?'
    },
    password_recovery: {
        title: 'Passwort-Wiederherstellung',
        forgot_password: 'Passwort vergessen',
        field_inputs: {
            email: 'E-Mail',
            new_password: 'Neues Kennwort',
            cnf_password: 'Bestätige das Passwort'
        }
    },
    accept_invite: {
        title: 'Einladung annehmen',
        invalid_invite: 'Ungültige Einladung',
        invite: 'einladen',
        sign_up: 'Melden Sie sich bei Appwrite an',
        warning_alert: {
            title: 'Der Einladungslink ist ungültig',
            sub_title: 'Bitten Sie den Projektinhaber, Ihnen eine neue Einladung zu senden.'
        },
        success_alert: {
            title: 'Sie wurden eingeladen, an einem Teamprojekt auf Appwrite teilzunehmen'
        }
    },
    privacy_and_policy: {
        main_text: 'Indem Sie die Einladung annehmen, erklären Sie sich damit einverstanden',
        terms_and_condition: 'Geschäftsbedingungen',
        and: 'Und',
        privacy_policy: 'Datenschutz und Richtlinien'
    }
};

export default de;
