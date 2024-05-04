//@ts-ignore no type declaration
import { TCPSocketPort } from "osc"

/** Type a OSC argument can be */
export type OSCArgVal = number | string

/**
 * OSC Message to interface with. Basically just translate from `address` to `message`
 * */
export interface OSCMsg {
    message: string
    args: OSCArgVal[]
}

/**
 * OSC Message that the server send a receive.
 * */
export interface OSCSerMsg {
    address: string
    args: OSCArgVal[]
}

export type listenerFunc = (msg: OSCArgVal[]) => void

/**
 * A TCP port to revieve and send OSC messages
 * */
export class TCPSocket {
    host: string
    port: number
    private server: any
    private listener: Set<string> = new Set()

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
        this.on("message", (msg: OSCSerMsg) => {
            this.listener.forEach(m => {
                if (msg.address === m) this.server.emit(m, msg.args)
            })
        })
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
     * Trigger when `message` is recieve by the socket
     * @param message The message to listen for
     * @callback The callback when `message` is receive
     * */
    onMsg(message: string, callback: listenerFunc) {
        this.server.on(message, callback) // a new listener for it
        this.listener.add(message)
    }

    /**
     * A one time trigger when `message` is recieve
     * */
    onceMsg(message: string, callback: listenerFunc) {
        this.server.once(message, callback)
        this.listener.add(message)
    }

    /**
     * Send a message to the socket
     * @param message The message to send
     * @param [args=[]] The arguments to send with this message
     * */
    send(message: string, args: OSCArgVal[] = []) {
        this.server.send({
            address: message,
            args: args,
        })
    }
    /**
     * Disconnect from the port
     * */
    disconnect() {
        this.server.close()
    }
}
