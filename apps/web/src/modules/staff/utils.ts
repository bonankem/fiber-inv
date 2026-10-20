import type { UserFullT } from "schema/people";

export function userRole(user: UserFullT) {
  if (user.isAdmin) return "Admin";
  if (user.staffRole) return "MTN";
  return "Vendor";
}

export function userGroup(user: UserFullT) {
  if (user.isAdmin) return "Admin";
  if (user.staffRole) return staffRoleName(user.staffRole);
  return user.vendor?.name;
}

export function roleName(user: UserFullT) {
  if (user.isAdmin) return "Admin";
  if (user.staffRole) return staffRoleName(user.staffRole);
  return "Vendor";
}

export function staffRoleName(s: string) {
  return s.replace(/_/g, " ").replace(/\B[A-Z]+/g, (s) => s.toLowerCase());
}
