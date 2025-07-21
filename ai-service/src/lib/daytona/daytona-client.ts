import * as _path from 'path';
import { Daytona } from "@daytonaio/sdk";

export const daytona = new Daytona({
    target: "us",
    apiKey: process.env.DAYTONA_API_KEY!,
    apiUrl: "https://app.daytona.io/api"
});
