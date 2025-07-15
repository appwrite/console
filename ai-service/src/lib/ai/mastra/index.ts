
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherAgent } from './agents/weather-agent';
import { codeWorkflow } from './workflows/code-workflow';
import { architectAgent } from './agents/architect-agent';
import { developerAgent } from './agents/developer-agent';

export const mastra = new Mastra({
  workflows: { codeWorkflow },
  agents: { architectAgent, developerAgent },
  // storage: new LibSQLStore({
  //   url: "file:../mastra.db",
  // }),
  
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  // aiSdkCompat: "v4"
});
