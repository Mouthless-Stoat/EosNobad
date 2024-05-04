//@ts-ignore no type
import { TCPSocketPort } from "osc"

export type OSCArgVal = number | string

export enum OSCArgChar {
    int = "i",
    float = "f",
    string = "s",
}

export type OSCArg = { type: OSCArgVal; value: OSCArgVal }

export interface OSCMsg {
    message: string
    args: OSCArgVal[]
}

/**
 * A TCP port to revieve and send OSC messages
 * */
export class TCPSocket {
    host: string
    port: number
    private server: any

    constructor(host: string, port: number) {
        this.host = host
        this.port = port

        this.server = new TCPSocketPort({
            address: host,
            port: port,
        })
    }

    /**
     * Connect to the port
     * */
    connect() {
        this.server.open() // open the server
    }

    /**
     * Trigger when a event is emited:
     * "ready": when the socket is ready
     * "message": when the socket receive a message. Usually onMsg is better because it filter out messages
     * @param event The event to listen for
     * @param callback The callback when event is trigger
     * */
    on(event: "ready" | "message", callback: CallableFunction) {
        this.server.on(event, callback)
    }

    /**
     * Trigger when `message` is revieve by the socket
     * @param message The message to listen for
     * @callback The callback when `message` is receive
     * */
    onMsg(message: string, callback: (msg: OSCMsg) => void) {
        this.on("message", (msg: OSCMsg) => {
            if (msg.message === message) {
                callback(msg)
            }
        })
    }

    send(message: string, args: OSCArgVal[] = []) {
        // process the args
        let oscArgs: OSCArg[] = []
        for (const arg of args) {
            let argType: OSCArgChar
            switch (typeof arg) {
                case "string":
                    argType = OSCArgChar.string
                    break
                case "number":
                    argType = arg % 1 === 0 ? OSCArgChar.int : OSCArgChar.float
            }

            oscArgs.push({
                type: argType,
                value: arg,
            })
        }

        // add a slash incase user forgot
        if (!message.startsWith("/")) message = "/" + message

        this.server.send({
            address: message,
            args: oscArgs,
        })
    }
    /**
     * Disconnect from the port
     * */
    disconnect() {
        this.server.close()
    }
}
