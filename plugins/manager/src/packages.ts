import { Adapter, App, Context, Dict, omit, pick, Schema } from 'koishi'
import { DataSource } from '@koishijs/plugin-console'
import { readdir, readFile } from 'fs/promises'
import { dirname } from 'path'
import { Package } from './utils'

function unwrap(module: any) {
  return module.default || module
}

export class PackageProvider extends DataSource<Dict<PackageProvider.Data>> {
  cache: Dict<Promise<PackageProvider.Data>> = {}
  task: Promise<void>

  constructor(ctx: Context, config: PackageProvider.Config) {
    super(ctx, 'packages')

    ctx.on('connect', () => this.start())
  }

  start() {
    this.ctx.on('plugin-added', async (plugin) => {
      const entry = Object.entries(require.cache).find(([, { exports }]) => unwrap(exports) === plugin)
      if (!entry) return
      const state = this.ctx.app.registry.get(plugin)
      const local = await this.cache[entry[0]]
      local.id = state.id
      this.broadcast()
    })

    this.ctx.on('plugin-removed', async (plugin) => {
      const entry = Object.entries(require.cache).find(([, { exports }]) => unwrap(exports) === plugin)
      if (!entry) return
      const local = await this.cache[entry[0]]
      delete local.id
      this.broadcast()
    })
  }

  async prepare() {
    // load local packages
    let { baseDir } = this.ctx.app.options
    while (1) {
      const base = baseDir + '/node_modules'
      const files = await readdir(base).catch(() => [])
      for (const name of files) {
        const base2 = base + '/' + name
        if (name.startsWith('@')) {
          const files = await readdir(base2).catch(() => [])
          for (const name2 of files) {
            if (name === '@koishijs' && name2.startsWith('plugin-') || name2.startsWith('koishi-plugin-')) {
              const fullname = name + '/' + name2
              this.cache[fullname] = this.loadPackage(base + '/' + fullname)
            }
          }
        } else {
          if (name.startsWith('koishi-plugin-')) {
            this.cache[name] = this.loadPackage(base2)
          }
        }
      }
      const parent = dirname(baseDir)
      if (baseDir === parent) break
      baseDir = parent
    }
  }

  async get(forced = false) {
    if (forced || !this.task) {
      this.task = this.prepare()
    }
    await this.task

    // add app config
    const packages = await Promise.all(Object.values(this.cache))
    packages.unshift({
      name: '',
      shortname: '',
      schema: App.Config,
      config: omit(this.ctx.app.options, ['plugins' as any]),
    })

    return Object.fromEntries(packages.filter(x => x).map(data => [data.name, data]))
  }

  private async loadPackage(path: string) {
    const data: Package.Local = JSON.parse(await readFile(path + '/package.json', 'utf8'))
    if (data.private) return null

    const result = pick(data, ['name', 'version', 'description']) as PackageProvider.Data

    // workspace packages are followed by symlinks
    result.workspace = !require.resolve(path).includes('node_modules')
    result.shortname = data.name.replace(/(koishi-|^@koishijs\/)plugin-/, '')

    // check adapter
    const oldLength = Object.keys(Adapter.library).length
    const exports = unwrap(require(path))
    const newLength = Object.keys(Adapter.library).length
    if (newLength > oldLength) this.sources.protocols.broadcast()

    // check plugin dependencies
    Object.assign(result, Package.Meta.from(data))

    // check plugin state
    const state = this.ctx.app.registry.get(exports)
    result.id = state?.id
    result.config = state?.config
    result.schema = exports?.Config

    // get config for disabled plugins
    if (!result.config) {
      const { plugins = {} } = this.ctx.app.options
      result.config = plugins['~' + result.shortname]
    }

    return result
  }
}

export namespace PackageProvider {
  export interface Config {}

  export interface Data extends Partial<Package.Base> {
    id?: string
    config?: any
    shortname?: string
    schema?: Schema
    devDeps?: string[]
    peerDeps?: string[]
    keywords?: string[]
    workspace?: boolean
  }
}
