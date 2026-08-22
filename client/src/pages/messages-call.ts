export type CallMode = "voice" | "video";

export function callStatusCopy(mode: CallMode, name: string) {
  const access = mode === "video" ? "Camera and microphone are" : "Microphone is";
  return {
    title: `Local ${mode} preview`,
    detail: `${access} active on this device. Remote signaling is not connected, so ${name} has not been invited.`,
  };
}

