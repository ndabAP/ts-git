#!/usr/bin/env node
import { TsGit } from '@nathanfriend/ts-git';
import * as yargs from 'yargs';

const tsGit = new TsGit();

yargs
  .command('init', 'Create an empty Git repository', {}, argv => {
    tsGit.init(process.cwd());
  })
  .help('h')
  .alias('h', 'help')
  .demandCommand().argv;
