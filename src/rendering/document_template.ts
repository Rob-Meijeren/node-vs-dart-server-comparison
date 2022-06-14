import pug from 'pug';
import md5 from 'md5';
import { promises as fs } from 'fs';

const tplBaseDir = `${__dirname}/../templates`;

/**
 * The template cache will contain compiled pug templates and a hash of the
 * template content to detect changes
 *
 * @export
 * @interface ITemplateCache
 */
interface ITemplateCache
{
  [templateName: string]: {
    hash: string;
    compiledTemplate: pug.compileTemplate;
  };
}

/**
 * We will collect compiled templates to prevent us from compiling all of them
 * for each render request.
 * A hash is used to determine if the template has changed
 */
const compiledTemplates: ITemplateCache = {};

/**
 * Retrieves a compiled template from the cache or adds a new template
 *
 * @param templateId The template database identifier
 * @param content The template content
 * @param options Option parameters for PUG compilation
 */
const getCompiledTemplate = async (templateName: string, options?: pug.Options, refresh = false): Promise<pug.compileTemplate> => {
  const cachedTemplate = compiledTemplates[templateName];

  const content = (await fs.readFile(`${tplBaseDir}/${templateName}.pug`)).toString();
  const contentHash = md5(content);

  if (cachedTemplate && cachedTemplate.hash === contentHash && !refresh) {
    // Return from cache
    //
    return cachedTemplate.compiledTemplate;
  }

  console.debug(`[DOCUMENT-TEMPLATE] Compiling pug template ${templateName} with hash ${contentHash}`);

  // Compile the new template
  //
  const compiledTemplate = pug.compile(content);

  // Add the template to the cache
  //
  compiledTemplates[templateName] = {
    compiledTemplate,
    hash: contentHash,
  };

  return compiledTemplate;
};

export class DocumentTemplate {
  public async generate(templateName: string, data: any): Promise<string> {

    console.debug(`[DOCUMENT-TEMPLATE] Generating document for template ${templateName}`);

    // Compile the PUG template or take it from the cache
    //
    const compiledTemplate = await getCompiledTemplate(templateName);

    // Render using provided data
    //
    const renderedTemplate = compiledTemplate(data);

    return renderedTemplate;
  }
}

export const documentTemplate = new DocumentTemplate();
