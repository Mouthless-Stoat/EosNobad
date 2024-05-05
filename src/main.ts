import { EosConsole } from "./console"
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const eos = new EosConsole("192.168.2.55", 8000)
await eos.connect()
eos.send("/eos/ping")

// const rl = createInterface({ input, output })
// console.log(await eos.ask("get/patch/2/1", "out/get/patch/1/list/0/21"))
