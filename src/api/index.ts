import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import { Server } from 'typescript-rest';
import { errorJSON } from './error-json';
import routes from './routes';
var cors = require('cors')

/**
 * The express based HTTP server
 *
 * @export
 * @class API
 */
export class API
{
  private app: express.Application;
  private listener!: http.Server;

  /**
   * Creates an instance of API.
   *
   * @param {DatastoreClient} datastore The datastore instance
   * @memberof API
   */
  constructor() {
    console.log('[API] Starting up...');
    this.app = express();

    /**
     * Configure CORS support
     */
    this.app.use(cors());
    this.app.options('*', cors()); // Enable CORS-preflight

    /**
     * Initialise and setup Express application
     */
    this.app.use(cookieParser());

    /**
     * Setup static hosting for API docs
     */
     this.app.use('/docs', express.static(`${(global as any).appRoot}/public`));

    this.app.use(bodyParser.json({ type: 'application/json' }));

    /**
     * Restore expected behaviour to not call middleware after service
     */
    Server.ignoreNextMiddlewares(true);

    /**
     * Register all the routes
     */
    Server.buildServices(this.app, ...routes);

    /**
     * Send 404 as errors
     */
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      throw {
        code: 404,
        message: 'Unknown route requested',
        name: 'NOT_FOUND',
      };
    });

    /**
     * All errors should be JSON
     */
    this.app.use(errorJSON);
  }

  /**
   * Starts the API
   *
   * @param {number} [port=8888] The port the API listens on
   * @memberof API
   */
  public start(port = 8888) {
    this.listener = this.app.listen(port, () => {
      console.log(`[API] Listening on ${port}`);
    });

    // Listen for process exit to shutdown the api
    //
    process.on('exit', () => {
      this.listener.close(error => console.log('[API] Shutdown due to EXIT', error));
    });

    process.on('SIGINT', () => {
      this.listener.close(error => console.log('[API] Shutdown due to SIGINT', error));
    });
  }
}
