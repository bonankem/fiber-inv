import { appPlugin } from "#/utils/routing";
import {
  fiberInventoryGetApi,
  fiberInventoryUploadApi,
} from "./fiber-inventory.api";

export default appPlugin((app) => {
  app.register(fiberInventoryGetApi);
  app.register(fiberInventoryUploadApi);
});
