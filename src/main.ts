import * as core from '@actions/core'
import * as github from '@actions/github'
const fs = require('fs');
const exec = require('@actions/exec');

async function run(): Promise<void> {
  if (!checkIfValidUser()) return;

  try {
    const url: string = core.getInput('url');

    const splitUrl: string[] = url.split("/");

    const username: string = splitUrl[splitUrl.length - 2];

    await exec.exec('git submodule add ' + url + ' submodules/' + username);

    fs.readdirSync('./submodules/' + username).forEach((file: string) => {
      if (file.match('/^\d*$/g')) {
        addLink(file, username);
      }
    });

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function addLink(year: string, username: string) {
  if (!fs.existsSync(year)) {
    core.debug('Create dir ' + year);
    fs.mkdirSync(year);
  }
  await exec.exec('ln -s ./submodules/' + username + '/' + year + ' ./' + year + '/' + username);
}

function checkIfValidUser(): boolean {
  let isValid: boolean = false;
  core.getInput('users').split(' ').forEach((user: string) => {
    if (user == github.context.actor) {
      core.debug(user + '==' + github.context.actor);
      isValid = true;
    }
  });

  return isValid;
}

run()
