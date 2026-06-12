import type { UserFullT } from "schema/people";

export function roleName(user: UserFullT) {
  if (user.isAdmin) return "Admin";
  if (user.staffRole) return staffRoleName(user.staffRole);
  return "Vendor";
}

export function staffRoleName(s: string) {
  return s.replace(/_/g, " ").replace(/\B[A-Z]+/g, (s) => s.toLowerCase());
}
