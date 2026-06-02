import { cpSync, mkdirSync, rmSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, "../apps/editor/dist")
const dest = resolve(__dirname, "../public/freecut-editor")

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log("FreeCut dist copied to public/freecut-editor/")
