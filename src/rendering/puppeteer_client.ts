import { get } from 'lodash';
import puppeteer from 'puppeteer-core';
import * as request from 'request';
import { IServiceResponse } from '../typings/api';

export class PuppeteerClient
{
  /**
   * The browserless host
   *
   * @type {string}
   * @memberof Renderer
   */
  public host!: string;

  /**
   * The browserless port
   *
   * @type {number}
   * @memberof Renderer
   */
  public port!: number;

  /**
   * The renderer browser user agent
   *
   * @type {string}
   * @memberof Renderer
   */
  public browserUserAgent!: string;

  /**
   * The renderer browser version
   *
   * @type {string}
   * @memberof Renderer
   */
  public browserVersion!: string;

  /**
   * Connect to browserless with puppeteer
   *
   * @param {string} host
   * @param {number} port
   * @memberof Renderer
   */
  public connect(host: string, port: number): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      // Save the supplied browserless details
      //
      this.host = host;
      this.port = port;

      try {
        // Connect, fetch browser details and disconnect to test
        //
        const socketUrl       = `ws://${this.host}:${this.port}`;
        const browser         = await puppeteer.connect({ browserWSEndpoint: socketUrl });
        this.browserUserAgent = await browser.userAgent();
        this.browserVersion   = await browser.version();

        browser.disconnect();
        resolve([this.browserUserAgent, this.browserVersion]);
      } catch (error) {
        console.error('Failed to connect to browserless', error);
        reject(error);
      }
    });
  }

  /**
   * Renders a PDF from supplied HTML content
   *
   * @param {string} html
   * @param {puppeteer.PDFOptions} options
   * @returns
   * @memberof Renderer
   */
  public pdfFromString(html: string, options?: Partial<puppeteer.PDFOptions>): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Connect, fetch browser details and disconnect to test
        //
        const socketUrl = `ws://${this.host}:${this.port}`;
        const browser   = await puppeteer.connect({ browserWSEndpoint: socketUrl });

        // Whilst there is no way of waiting for all requests to finish with setContent,
        // you can simulate a webrequest this way
        // see issue for more details: https://github.com/GoogleChrome/puppeteer/issues/728
        //
        const page = await browser.newPage();

        // Setup a page request interceptor
        // First request will return our HTML content
        // All follow up requests which will be page assets and links should
        // be retrieved as normal
        //
        await page.setRequestInterception(true);
        page.once('request', (pageRequest) => {
          pageRequest.respond({ body: html });
          page.on('request', assetRequest => assetRequest.continue());
        });

        // Dummy request to trigger the interceptor
        // The URL called here is not important
        //
        await page.goto('http://localhost', { waitUntil: 'load' });
        await this.waitTillHTMLRendered(page);

        // Render the PDF
        //
        const data = await page.pdf(options);

        // Always release connection
        //
        await page.close();
        browser.disconnect();

        resolve(data);
      } catch (error) {
        console.error('Failed to render using browserless', error);
        reject(error);
      }
    });
  }

  /**
   * Renders a PDF from supplied URL
   *
   * @param {string} url
   * @param {puppeteer.PDFOptions} options
   * @returns
   * @memberof Renderer
   */
  public pdfFromUrl(url: string, options?: Partial<puppeteer.PDFOptions>): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Connect, fetch browser details and disconnect to test
        //
        const socketUrl = `ws://${this.host}:${this.port}`;
        const browser   = await puppeteer.connect({ browserWSEndpoint: socketUrl });

        // Wait for the requested URL to load
        //
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'load' });
        await this.waitTillHTMLRendered(page);

        // Render the PDF
        //
        const data = await page.pdf(options);

        // Always release connection
        //
        await page.close();
        browser.disconnect();

        resolve(data);
      } catch (error) {
        console.error('Failed to render using browserless', error);
        reject(error);
      }
    });
  }

  /**
   * Fetch the browserless render metrics using its REST api
   *
   * @returns {Promise<any>}
   * @memberof Renderer
   */
  public metrics(): Promise<IServiceResponse> {
    return new Promise((resolve, reject) => {
      const metricUrl = `http://${this.host}:${this.port}/metrics`;

      const callOptions: request.Options = {
        url:      `http://${this.host}:${this.port}/metrics`,
        method:   'GET',
        json:     true,
      };

      request.get(callOptions, (error, response, body) => {
        const statusCode: number = get(response, 'statusCode') || 500;
        if (error || statusCode < 200 || statusCode >= 300) {
          console.error('[RENDERER] Failed to fetch browserless metrics', error, statusCode, body);
          reject({
            name:    'ERROR',
            code:    statusCode,
            message: 'Failed to fetch metrics',
            data:    body,
          });
        } else {
          console.debug('[RENDERER] Fetched browserless metrics', body);
          resolve({
            name:    'OK',
            code:    statusCode,
            message: 'Fetched metrics',
            data:    body,
          });
        }
      });
    });
  }

  private waitTillHTMLRendered = async (page: puppeteer.Page, timeout = 30000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
  
    while(checkCounts++ <= maxChecks){
      let html = await page.content();
      let currentHTMLSize = html.length; 
  
      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; //reset the counter
  
      if(countStableSizeIterations >= minStableSizeIterations) {
        console.log("Page rendered fully..");
        break;
      }
  
      lastHTMLSize = currentHTMLSize;
      await page.waitForTimeout(checkDurationMsecs);
    }  
  };
}

// Export singleton renderer
//
export const puppeteerClient = new PuppeteerClient();
