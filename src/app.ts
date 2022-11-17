import { makeServer } from './makeServer';
import { WonkaLogger } from './lib/helpers/logger';



//TODO return 200 status on warning confirmation from metaplex
const logger = WonkaLogger.with('server');
const server = makeServer({logger});
console.log('Starting Server');
server.start();
