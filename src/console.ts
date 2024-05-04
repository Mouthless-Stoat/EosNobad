import { OSCArgVal, OSCMsg, TCPSocket } from "./server"

/**
 * Enum store all eos OSC key name
 * */
export enum EosKey {
    blind,
    clear_cmdline,
}

export class EosConsole {
    host: string
    port: number
    server: TCPSocket

    private _commandLine!: string

    get commandLine() {
        return this._commandLine
    }

    constructor(host: string, port: number) {
        this.host = host
        this.port = port
        this.server = new TCPSocket(host, port)
    }

    connect() {
        this.server.onMsg("/eos/out/cmd", msg => console.log(msg))
        this.server.connect()
    }

    /**
     * Send a OSC message to the console. Message is already prepend with "/eos/"
     * @param message The message to send
     * @param args The argument with that message
     * */
    send(message: OSCMsg): void
    send(message: string, args: OSCArgVal[]): void
    send(message: string | OSCMsg, args?: OSCArgVal[]) {
        if (typeof message !== "string") {
            let t = message
            message = t.message
            args = t.args
        }
        this.server.send("/eos/" + message, args)
    }

    disconnect() {
        this.server.disconnect()
    }
}
