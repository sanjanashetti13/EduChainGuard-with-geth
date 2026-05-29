import { apiRequest } from "./client";
import type {
  AdminStats,
  MessageResponse,
  UploadsPerDayPoint,
  UserActivityResponse,
  VerifierActivityResponse,
} from "./types";

export const adminApi = {
  getStats: () => apiRequest<AdminStats>("/admin/stats"),

  getUploadsPerDay: () =>
    apiRequest<UploadsPerDayPoint[]>("/admin/uploads-per-day"),

  getUserActivity: () =>
    apiRequest<UserActivityResponse>("/admin/user-activity"),

  getVerifierActivity: () =>
    apiRequest<VerifierActivityResponse>("/admin/verifier-activity"),

  clearLogs: () =>
    apiRequest<MessageResponse>("/admin/clear-logs", { method: "DELETE" }),
};
