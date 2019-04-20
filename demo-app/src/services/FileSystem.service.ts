import { BrowserFSService } from './BrowserFS.service';
import * as path from 'path';
import FS from 'browserfs/dist/node/core/FS';

export interface FileSystemItem {
  name: string;
  path: string;
  isFolder: boolean;
  isFolderOpen: boolean;
  children: FileSystemItem[];
}

export class FileSystemService {
  /**
   * Recursively gets the contents of a directory
   * as a FileSystemItem[]
   * @param directory The root directory to fetch
   */
  static async getDirectoryContents(
    directory: string,
  ): Promise<FileSystemItem[]> {
    const filesAndFolders = await this.getDirectoryContentsRecurse(directory);
    this.sortFileSystemItems(filesAndFolders);
    return filesAndFolders;
  }

  /**
   * Gets the contents of a file as a string
   * @param filePath The path of the file to get
   */
  public static async getFileContents(filePath: string): Promise<string> {
    const fs = await BrowserFSService.fsPromise;

    try {
      return await fs.readFileAsync(filePath, 'utf8');
    } catch (err) {
      return '';
    }
  }

  /**
   * Renames a file or folder
   * @param oldPath The full path of the file or folder to rename
   * @param newPath The new path of the file or folder
   */
  public static async renameFileOrFolder(
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const fs = await BrowserFSService.fsPromise;
    await fs.renameAsync(oldPath, newPath);
  }

  /**
   * Returns a boolean indicating if the path is a directory
   * @param filePath The path to test
   */
  public static async isDirectory(filePath: string) {
    const fs = await BrowserFSService.fsPromise;

    return (await fs.lstatAsync(filePath)).isDirectory();
  }

  private static async getDirectoryContentsRecurse(
    directory: string,
  ): Promise<FileSystemItem[]> {
    const fs = await BrowserFSService.fsPromise;

    const filesAndFolders: FileSystemItem[] = [];
    const contents = await fs.readdirAsync(directory);

    for (const item of contents) {
      const itemPath = path.join(directory, item);
      const isDirectory = await this.isDirectory(itemPath);

      filesAndFolders.push({
        name: item,
        path: itemPath,
        isFolder: isDirectory,
        isFolderOpen: isDirectory,
        children: isDirectory ? await this.getDirectoryContents(itemPath) : [],
      });
    }

    return filesAndFolders;
  }

  private static sorter(a: FileSystemItem, b: FileSystemItem) {
    if (a.isFolder && !b.isFolder) {
      return -1;
    } else if (!a.isFolder && b.isFolder) {
      return 1;
    } else {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName < bName) {
        return -1;
      }
      if (aName > bName) {
        return 1;
      }

      return 0;
    }
  }

  private static sortFileSystemItems(items: FileSystemItem[]) {
    items.sort(this.sorter);
    for (const item of items) {
      if (item.isFolder) {
        this.sortFileSystemItems(item.children);
      }
    }
  }
}
