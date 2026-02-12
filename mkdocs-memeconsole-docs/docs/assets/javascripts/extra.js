window.addEventListener("load", () => {
  if (typeof mermaid !== "undefined") {
    mermaid.initialize({
      startOnLoad: true,
      theme: "base",
      themeVariables: {
        background: "#0b0118",
        primaryColor: "#161129",
        primaryTextColor: "#f8fafc",
        primaryBorderColor: "#7c3aed",
        lineColor: "#a78bfa",
        secondaryColor: "#161021",
        tertiaryColor: "#130b22",
      },
    });
  }
});
