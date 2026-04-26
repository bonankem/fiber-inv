import { bad } from "#/utils";

export function badLogin(): never {
  bad("Invalid email or password");
}
