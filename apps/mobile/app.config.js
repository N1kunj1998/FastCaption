const appJson = require("./app.json");

// Load .env so EXPO_PUBLIC_* and other vars are available when config is evaluated
require("dotenv").config({ path: ".env" });

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      apiUrl,
    },
  },
};
