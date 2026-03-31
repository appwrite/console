/**
 * Runtime enum values for dedicated database features not yet in the
 * @appwrite.io/console SDK. Remove once the SDK exports them natively.
 */

export enum Engine {
    Postgres = 'postgres',
    MySQL = 'mysql',
    MariaDB = 'mariadb',
    MongoDB = 'mongodb'
}

export enum Backend {
    Edge = 'edge',
    Cloud = 'cloud'
}

export enum Period {
    OneHour = '1h',
    TwentyFourHours = '24h',
    SevenDays = '7d',
    ThirtyDays = '30d',
    NinetyDays = '90d'
}

export enum Day {
    Sunday = 'sun',
    Monday = 'mon',
    Tuesday = 'tue',
    Wednesday = 'wed',
    Thursday = 'thu',
    Friday = 'fri',
    Saturday = 'sat'
}

export enum Mode {
    Transaction = 'transaction',
    Session = 'session'
}

export enum Type {
    Full = 'full',
    Incremental = 'incremental',
    Wal = 'wal',
    Backup = 'backup',
    Pitr = 'pitr'
}

export enum TargetRegion {
    Frankfurt = 'fra',
    NewYork = 'nyc',
    SanFrancisco = 'sfo',
    Bangalore = 'blr',
    London = 'lon',
    Sydney = 'syd',
    Toronto = 'tor',
    Amsterdam = 'ams',
    Singapore = 'sgp'
}

export enum HaSyncMode {
    Async = 'async',
    Sync = 'sync',
    Quorum = 'quorum'
}

export enum Provider {
    S3 = 's3',
    GCS = 'gcs',
    Azure = 'azure'
}

export enum TargetType {
    Shared = 'shared',
    Dedicated = 'dedicated'
}
