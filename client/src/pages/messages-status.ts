export function outgoingMessageStatus(message: { optimistic?: boolean }) {
  return message.optimistic ? "Sending…" : "Sent";
}
