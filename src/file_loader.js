import fs from 'fs';
import path from 'path';

const recursiveReadDirSync = dir =>
  fs.readdirSync(dir)
    .reduce((files, file) => (
      fs.statSync(path.join(dir, file)).isDirectory() ?
        files.concat(recursiveReadDirSync(path.join(dir, file))) :
        files.concat(path.join(dir, file))
      ),
      []);

const readDirSync = dir =>
  fs.readdirSync(dir)
    .reduce((files, file) => (
      fs.statSync(path.join(dir, file)).isDirectory() ?
        files :
        files.concat(path.join(dir, file))
      ),
      []);

const fileLoader = (folderPath, options = { recursive: false }) => {
  const dir = folderPath;
  const files = [];
  const schemafiles = options.recursive === true ?
                  recursiveReadDirSync(dir) :
                  readDirSync(dir);

  schemafiles.forEach((f) => {
    const pathObj = path.parse(f);

    if (pathObj.name.toLowerCase() === 'index') { return; }

    if (options.loadGraphql) {
      switch (pathObj.ext) {
        case '.graphqls':
        case '.gql':
        case '.graphql': {
          const file = fs.readFileSync(f, 'utf8');
          files.push(options.loader ? options.loader(file.toString()) : file.toString());
          break;
        }
  
        default:
      }
    } else if (options.loadResolvers) {
      if (pathObj.name.split('.')[1] === 'resolver') {
        const file = require(f); // eslint-disable-line
        const theFile = file.default || file;
        files.push(options.loader ? options.loader(theFile) : theFile);
      }
    }
  });
  return files;
};

export default fileLoader;
