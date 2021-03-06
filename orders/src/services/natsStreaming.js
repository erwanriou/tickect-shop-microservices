const { NatsWrapper } = require("./natsWrapper")
const { PaymentCreatedList } = require("../events/listeners/paymentCreatedList")
const { TicketCreatedList } = require("../events/listeners/ticketCreatedList")
const { TicketUpdatedList } = require("../events/listeners/ticketUpdatedList")
const {
  ExpirationCompletedList
} = require("../events/listeners/expirationCompletedList")

module.exports = async natsStreaming => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined")
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined")
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined")
  }
  // CONNECT NATS
  await NatsWrapper.connect(
    process.env.NATS_CLUSTER_ID,
    process.env.NATS_CLIENT_ID,
    process.env.NATS_URL
  )
  // GRACEFULLY CLOSE
  NatsWrapper.client().on("close", () => {
    console.log("NATS connection closed")
    process.exit()
  })
  process.on("SIGINT", () => NatsWrapper.client().close())
  process.on("SIGTERM", () => NatsWrapper.client().close())

  // LISTENNING TRAFFIC
  new TicketCreatedList(NatsWrapper.client()).listen()
  new TicketUpdatedList(NatsWrapper.client()).listen()
  new ExpirationCompletedList(NatsWrapper.client()).listen()
  new PaymentCreatedList(NatsWrapper.client()).listen()
}
