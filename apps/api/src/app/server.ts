import { env } from "../config/env";
import { registerNotificationListeners } from "../modules/notifications";
import { createApp } from "./app";

registerNotificationListeners();

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`SLOTIX API a correr em http://localhost:${env.PORT}`);
});
