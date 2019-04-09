import { CommandResult } from './CommandResult';
import { findRepoRoot } from '../../util/file-system/find-repo-root';
import { notAGitRepoResult } from './shared/not-a-git-repo-result';
import * as path from 'path';
import * as bluebird from 'bluebird';
import { GitObjectType } from '../models/GitObjectType';
import { GitObject } from '../models/GitObject';
import { GitBlob } from '../models/GitBlob';

const zlib = require('zlib');
bluebird.promisifyAll(zlib);

export const catFileCommand = async (
  fs: any,
  cwd: string,
  type: GitObjectType,
  object: string,
): Promise<CommandResult<GitObject>> => {
  const repoRoot = await findRepoRoot(fs, cwd);
  if (!repoRoot) {
    return notAGitRepoResult;
  }

  const objDirectory = object.substring(0, 2);
  const objFilename = object.substring(2);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await fs.readFileAsync(
      path.resolve(repoRoot, '.git', objDirectory, objFilename),
    );
  } catch (err) {
    return {
      success: false,
      message: `fatal: Not a valid object name ${object}`,
    };
  }

  let gitObj: GitObject;
  if (type === 'blob') {
    gitObj = new GitBlob();
  } else {
    throw new Error(`type ${type} is not yet implemented`);
  }
  try {
    await gitObj.deserialize(fileBuffer);
  } catch (err) {
    return {
      success: false,

      // TODO: what message does the real git show in this situation?
      message: `fatal: Unable to read object ${object}. ${err}`,
    };
  }

  return {
    success: true,
    message: gitObj.getContents(),
    data: gitObj,
  };
};
