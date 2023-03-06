import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const url: string = core.getInput('url')
    const path: string = core.getInput('submodule_save_location')

    if (core.getInput('update_submodules') === 'true') {
      await exec.exec('git submodule update --remote')
    }

    if (url != null && url.match(/^https:\/\/.*\.git$/)) {
      await addSubmodule(url, path)
    }

    if (core.getInput('relink_submodules') === 'true') {
      reloadAllSubmodules(path)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function addSubmodule(url: string, path: string): Promise<void> {
  const splitUrl: string[] = url.split('/')

  const username: string = splitUrl[splitUrl.length - 2]

  await exec.exec(`git submodule add ${url} ${path}/${username}`)

  const fileNames: string[] = fs.readdirSync(`./${path}/${username}`)

  core.debug(
    `There are ${fileNames.length.toString()} files in the new submodule`
  )

  const regex = RegExp(core.getInput('regex'))

  for (const file of fileNames) {
    if (regex.test(file)) {
      core.debug(`Add link for file ${file}`)
      addLink(file, username, path)
    }
  }
}

async function reloadAllSubmodules(path: string): Promise<void> {
  const submoduleNames: string[] = fs.readdirSync(`./${path}`)

  for (const submoduleName of submoduleNames) {
    const fileNames: string[] = fs.readdirSync(`./${path}/${submoduleName}`)
    const regex = RegExp(core.getInput('regex'))

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
  core.debug(`Add ${targedName} for ${username} if necessary`)
  if (!fs.existsSync(targedName)) {
    core.debug(`Create dir ${targedName}`)
    fs.mkdirSync(targedName)
  }
  await exec.exec(
    `ln -s ../${path}/${username}/${targedName} ./${targedName}/${username}`
  )
}

run()
