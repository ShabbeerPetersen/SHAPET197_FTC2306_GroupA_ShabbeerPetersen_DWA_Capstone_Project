import React from "react";
import App from "src/App.jsx";
import { PRISMANE_COLORS, PrismaneProvider } from "@prismane/core";

const Themes = () => {
  const theme = {
    mode: "dark",
    colors: {
      primary: { ...PRISMANE_COLORS.ruby },
      base: { ...PRISMANE_COLORS.slate },
    },
    spacing: "5px",
  };

  return (
    <PrismaneProvider theme={theme}>
      <App />
    </PrismaneProvider>
  );
};

export default Themes;
