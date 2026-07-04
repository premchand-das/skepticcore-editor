export function createLogger(scope) {
  return {
    info(message, data = null) {
      console.log(`[AI-DIRECTOR:${scope}] ${message}`, data || "");
    },

    warn(message, data = null) {
      console.warn(`[AI-DIRECTOR:${scope}] ${message}`, data || "");
    },

    error(message, error = null) {
      console.error(`[AI-DIRECTOR:${scope}] ${message}`, error || "");
    },
  };
}