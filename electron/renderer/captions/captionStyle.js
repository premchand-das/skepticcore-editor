export function buildCaptionStyle(theme = "cosmic") {
  if (theme === "dark") {
    return {
      fontColor: "white",
      boxColor: "black@0.55",
      outlineColor: "black",
      accentColor: "white",
    };
  }

  return {
    fontColor: "white",
    boxColor: "0x12001f@0.62",
    outlineColor: "0x000000",
    accentColor: "0xb88cff",
  };
}