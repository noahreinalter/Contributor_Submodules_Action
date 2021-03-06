import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const url: string = core.getInput('url')
    if (url != null && url.match(/^https:\/\/.*\.git$/)) {
      await addSubmodule(url)
    }

    if (core.getInput('reload_submodules') === 'true') {
      reloadAllSubmodules()
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function addSubmodule(url: string): Promise<void> {
  const splitUrl: string[] = url.split('/')

  const username: string = splitUrl[splitUrl.length - 2]

  await exec.exec(`git submodule add ${url} submodules/${username}`)

  const fileNames: string[] = fs.readdirSync(`./submodules/${username}`)

  core.debug(
    `There are ${fileNames.length.toString()} files in the new submodule`
  )

  const regex = RegExp(core.getInput('regex'))

  for (const file of fileNames) {
    if (regex.test(file)) {
      core.debug(`Add link for file ${file}`)
      addLink(file, username)
    }
  }
}

async function reloadAllSubmodules(): Promise<void> {
  const submoduleNames: string[] = fs.readdirSync('./submodules')

  for (const submoduleName of submoduleNames) {
    const fileNames: string[] = fs.readdirSync(`./submodules/${submoduleName}`)
    const regex = RegExp(core.getInput('regex'))

    for (const file of fileNames) {
      if (regex.test(file)) {
        addLink(file, submoduleName)
      }
    }
  }
}

async function addLink(targedName: string, username: string): Promise<void> {
  core.debug(`Add ${targedName} for ${username} if necessary`)
  if (!fs.existsSync(targedName)) {
    core.debug(`Create dir ${targedName}`)
    fs.mkdirSync(targedName)
  }
  await exec.exec(
    `ln -s ../submodules/${username}/${targedName} ./${targedName}/${username}`
  )
}

run()
