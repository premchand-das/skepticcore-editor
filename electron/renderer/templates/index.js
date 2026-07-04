import { documentaryTemplate } from "./documentary.js";
import { safeTemplate } from "./safe.js";
import { podcastTemplate } from "./podcast.js";
import { skepticcoreTemplate } from "./skepticcore.js";
import { minimalTemplate } from "./minimal.js";

const TEMPLATE_FACTORIES = {
  viral: () => ({ name: "viral" }),
  documentary: documentaryTemplate,
  podcast: podcastTemplate,
  skepticcore: skepticcoreTemplate,
  minimal: minimalTemplate,
  safe: safeTemplate,
};

export function listTemplates() {
  return Object.keys(TEMPLATE_FACTORIES).map((id) => {
    const template = TEMPLATE_FACTORIES[id]();

    return {
      id,
      name: template.name || id,
      supportsReel: true,
      supportsLandscape: id === "minimal" || id === "safe",
    };
  });
}

export function getTemplate(layout = "documentary") {
  const factory = TEMPLATE_FACTORIES[layout] || documentaryTemplate;
  return factory();
}