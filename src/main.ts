import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as github from '@actions/github'

async function run(): Promise<void> {
  if (!checkIfValidUser()) return

  try {
    const url: string = core.getInput('url')

    const splitUrl: string[] = url.split('/')

    const username: string = splitUrl[splitUrl.length - 2]

    await exec.exec(`git submodule add ${url} submodules/${username}`)

    const fileNames: string[] = fs.readdirSync(`./submodules/${username}`)

    core.debug(
      `There are ${fileNames.length.toString()} files in the new submodule`
    )

    for (const file of fileNames) {
      core.debug(file)
      if (file.match(/^\d*$/) != null) {
        addLink(file, username)
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function addLink(year: string, username: string): Promise<void> {
  core.debug(`Add ${year} for ${username}`)
  if (!fs.existsSync(year)) {
    core.debug(`Create dir ${year}`)
    fs.mkdirSync(year)
  }
  await exec.exec(
    `ln -s ../submodules/${username}/${year} ./${year}/${username}`
  )
}

function checkIfValidUser(): boolean {
  let isValid = false
  for (const user of core.getInput('users').split(' ')) {
    if (user === github.context.actor) {
      core.debug(`${user}===${github.context.actor}`)
      isValid = true
    }
  }

  return isValid
}

run()
