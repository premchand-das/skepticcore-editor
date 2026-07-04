import { net, protocol } from "electron";
import { pathToFileURL } from "node:url";

export function toPreviewUrl(filePath) {
  return `skepticcore-video://local/${encodeURIComponent(filePath)}`;
}

export function registerPreviewProtocol() {
  protocol.handle("skepticcore-video", async (request) => {
    const url = new URL(request.url);
    const encodedPath = url.pathname.replace("/", "");
    const filePath = decodeURIComponent(encodedPath);

    return net.fetch(pathToFileURL(filePath).toString());
  });
}