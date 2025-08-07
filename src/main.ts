import {getInput, setFailed, debug} from '@actions/core'
import {exec as exec_exec} from '@actions/exec'
import {readdirSync, existsSync, mkdirSync} from 'fs'

async function run(): Promise<void> {
  try {
    const url: string = getInput('url')
    const path: string = getInput('submodule_save_location')

    if (getInput('update_submodules') === 'true') {
      await exec_exec('git submodule update --remote')
    }

    if (url != null && url.match(/^https:\/\/.*\.git$/)) {
      await addSubmodule(url, path)
    }

    if (getInput('relink_submodules') === 'true') {
      reloadAllSubmodules(path)
    }
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

async function addSubmodule(url: string, path: string): Promise<void> {
  const splitUrl: string[] = url.split('/')

  const username: string = splitUrl[splitUrl.length - 2]

  await exec_exec(`git submodule add ${url} ${path}/${username}`)

  const fileNames: string[] = readdirSync(`./${path}/${username}`)

  debug(`There are ${fileNames.length.toString()} files in the new submodule`)

  const regex = RegExp(getInput('regex'))

  for (const file of fileNames) {
    if (regex.test(file)) {
      debug(`Add link for file ${file}`)
      addLink(file, username, path)
    }
  }
}

async function reloadAllSubmodules(path: string): Promise<void> {
  const submoduleNames: string[] = readdirSync(`./${path}`)

  for (const submoduleName of submoduleNames) {
    const fileNames: string[] = readdirSync(`./${path}/${submoduleName}`)
    const regex = RegExp(getInput('regex'))

    for (const file of fileNames) {
      if (regex.test(file)) {
        addLink(file, submoduleName, path)
      }
    }
  }
}

async function addLink(
  targedName: string,
  username: string,
  path: string
): Promise<void> {
  debug(`Add ${targedName} for ${username} if necessary`)
  if (!existsSync(targedName)) {
    debug(`Create dir ${targedName}`)
    mkdirSync(targedName)
  }
  await exec_exec(
    `ln -s ../${path}/${username}/${targedName} ./${targedName}/${username}`
  )
}

run()
