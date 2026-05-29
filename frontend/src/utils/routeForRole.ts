export function dashboardPathForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "institute":
      return "/admin/upload";
    case "verifier":
      return "/admin/verify";
    default:
      return "/admin/dashboard";
  }
}
