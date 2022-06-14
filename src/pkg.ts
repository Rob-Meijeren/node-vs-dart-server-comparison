import * as fs from 'fs';

/**
 * Normalised package info for consumption elsewhere in the app
 * Prevents us from have to read the JSON file multiple times
 *
 * @export
 * @interface IPackageInfo
 */
export interface IPackageInfo
{
  description: string;
  name: string;
  version: string;
}

const pkg = JSON.parse(fs.readFileSync(`${(global as any).appRoot }/../package.json`).toString());

export const packageInfo: IPackageInfo = {
  description: pkg.description,
  name: pkg.name,
  version: pkg.version,
};
