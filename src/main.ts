import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    const paths = ['node_modules', 'packages/*/node_modules/']
    const restoreKeys = ['angular-npm-']
    const file = fs.readFileSync('package-lock.json')
    const hash = crypto.createHash('sha256').update(file).digest('hex')
    const key = `angular-npm-${hash}`

    core.info(`Restore Cache from key ${key}`)
    if ((await cache.restoreCache(paths, key, restoreKeys)) !== key) {
      core.info('Cache Miss')
      core.info('Install Angular')
      await exec.exec('npm i @angular/cli')
      core.info('Install Packages')
      await exec.exec(`npm ci`)
      core.info('Save Cache')
      await cache.saveCache(paths, key)
    } else {
      core.info('Cache Hit')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
