import { type OSCArgVal, type OSCMsg, TCPSocket } from "./server"

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

    /**
     * Connect to the eos console using the host and port define earlier
     * */
    async connect() {
        this.server.onMsg("/eos/out/cmd", msg => {
            this._commandLine = msg.args[0] as string
        })
        this.server.connect()
        return new Promise<void>(res =>
            this.server.on("ready", () => {
                res()
                console.log("Im Ready")
            }),
        )
    }

    /**
     * Send a OSC generic message to the console. Message is already prepend with "/eos/"
     * @param message The message to send
     * @param args The argument with that message
     * */
    send(message: OSCMsg): void
    send(message: string, args?: OSCArgVal[]): void
    send(message: string | OSCMsg, args: OSCArgVal[] = []) {
        if (typeof message !== "string") {
            let t = message
            message = t.message
            args = t.args
        }
        this.server.send("/eos/" + message, args)
    }

    /**
     * Send text to be inputed into the command line
     * */
    sendCmd(command: string) {
        this.send("cmd", [command])
    }

    /**
     * Execute a command on the console. A terminator is already appended and the command line is clear
     * */
    executeCmd(command: string) {
        this.send("newcmd", [command + "#"])
    }

    /**
     * Disconnect from the console
     * */
    disconnect() {
        this.server.disconnect()
    }
}
