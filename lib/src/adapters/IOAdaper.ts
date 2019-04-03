export interface IOAdapter {
  /**
   * Reads a file and returns the contents as a string
   * @param filePath The path of the file to read
   */
  read(filePath: string): Promise<string>;

  /**
   * Writes a string to a file
   * @param filePath The file to write to
   * @param contents The contents to write
   */
  write(filePath: string, contents: string): Promise<void>;

  /**
   * Determines if the provided path exists and is a directory
   * @param path The path of the directory to test
   */
  isDirectory(path: string): Promise<boolean>;
}
