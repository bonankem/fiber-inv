import { appPlugin } from "#/utils/routing";
import {
  fiberInventoryGetApi,
  fiberInventoryUploadApi,
  fiberSourceDeleteApi,
  fiberSourceLayersApi,
  fiberSourceVisibleApi,
} from "./fiber-inventory.api";

export default appPlugin((app) => {
  app.register(fiberInventoryGetApi);
  app.register(fiberInventoryUploadApi);
  app.register(fiberSourceVisibleApi);
  app.register(fiberSourceLayersApi);
  app.register(fiberSourceDeleteApi);
});
