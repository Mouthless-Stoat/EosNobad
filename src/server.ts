//@ts-ignore no type
import { TCPSocketPort } from "osc"

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

/**
 * Convert server message to normal message
 * */
function serMsgToMsg(msg: OSCSerMsg): OSCMsg {
    return {
        message: msg.address,
        args: msg.args,
    } as OSCMsg
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
        this.on("message", (msg: OSCSerMsg) => {
            if (msg.address === message) {
                callback(serMsgToMsg(msg))
            }
        })
    }

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
