import { Image } from '@daytonaio/sdk';
import { daytona } from './daytona-client';

export async function buildImage() {
    const image = Image.base("daytonaio/sandbox")
        .workdir('/home/daytona/artifact')
        .runCommands('npm -v');

    console.log(' image', image);

    const snapshot = await daytona.snapshot.create(
        {
            name: 'imgn-vite:v3',
            image,
            resources: {
                cpu: 1,
                memory: 1,
                disk: 3
            }
        },
        {
            onLogs: console.log
        }
    );

    console.log('snapshot', snapshot);
}

buildImage();
