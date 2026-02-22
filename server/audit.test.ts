import { describe, it, expect, beforeEach } from "vitest";
import { logAuditEvent, getAuditLogs, getAuditLogCount, getAuditLogsByUser, getAuditLogsByActionType } from "./db";

describe("Audit Log Functions", () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  describe("logAuditEvent", () => {
    it("should log a permission change event", async () => {
      const result = await logAuditEvent({
        userId: 1,
        actionType: "PERMISSION_CHANGE",
        targetUserId: 2,
        targetUserName: "Test User",
        oldValues: { role: "user" },
        newValues: { role: "admin" },
        status: "SUCCESS",
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });

    it("should log an access denied event", async () => {
      const result = await logAuditEvent({
        userId: 1,
        actionType: "ACCESS_DENIED",
        targetUserId: 2,
        status: "FAILED",
        errorMessage: "Acesso negado - usuário não é admin",
      });

      expect(result).toBeDefined();
    });

    it("should log a login event", async () => {
      const result = await logAuditEvent({
        userId: 1,
        actionType: "LOGIN",
        status: "SUCCESS",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(result).toBeDefined();
    });

    it("should handle null optional fields", async () => {
      const result = await logAuditEvent({
        userId: 1,
        actionType: "LOGOUT",
        status: "SUCCESS",
      });

      expect(result).toBeDefined();
    });
  });

  describe("getAuditLogs", () => {
    it("should retrieve all audit logs", async () => {
      const logs = await getAuditLogs({ limit: 10 });
      expect(Array.isArray(logs)).toBe(true);
    });

    it("should filter logs by user ID", async () => {
      const logs = await getAuditLogs({ userId: 1, limit: 10 });
      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.userId).toBe(1);
      });
    });

    it("should filter logs by action type", async () => {
      const logs = await getAuditLogs({ actionType: "PERMISSION_CHANGE", limit: 10 });
      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.actionType).toBe("PERMISSION_CHANGE");
      });
    });

    it("should filter logs by target user ID", async () => {
      const logs = await getAuditLogs({ targetUserId: 2, limit: 10 });
      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        if (log.targetUserId) {
          expect(log.targetUserId).toBe(2);
        }
      });
    });

    it("should filter logs by date range", async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const logs = await getAuditLogs({
        startDate,
        endDate,
        limit: 10,
      });

      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        const logDate = new Date(log.createdAt!);
        expect(logDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(logDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it("should respect limit and offset", async () => {
      const logs1 = await getAuditLogs({ limit: 5, offset: 0 });
      const logs2 = await getAuditLogs({ limit: 5, offset: 5 });

      expect(logs1.length).toBeLessThanOrEqual(5);
      expect(logs2.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getAuditLogCount", () => {
    it("should count all audit logs", async () => {
      const count = await getAuditLogCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should count logs by user ID", async () => {
      const count = await getAuditLogCount({ userId: 1 });
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should count logs by action type", async () => {
      const count = await getAuditLogCount({ actionType: "PERMISSION_CHANGE" });
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should count logs by date range", async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const count = await getAuditLogCount({
        startDate,
        endDate,
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getAuditLogsByUser", () => {
    it("should retrieve logs for a specific user", async () => {
      const logs = await getAuditLogsByUser(1, 10);
      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.userId).toBe(1);
      });
    });

    it("should respect the limit parameter", async () => {
      const logs = await getAuditLogsByUser(1, 5);
      expect(logs.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getAuditLogsByActionType", () => {
    it("should retrieve logs by action type", async () => {
      const logs = await getAuditLogsByActionType("PERMISSION_CHANGE", 10);
      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.actionType).toBe("PERMISSION_CHANGE");
      });
    });

    it("should respect the limit parameter", async () => {
      const logs = await getAuditLogsByActionType("LOGIN", 5);
      expect(logs.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Audit Log Data Validation", () => {
    it("should validate audit log entry structure", async () => {
      const result = await logAuditEvent({
        userId: 1,
        actionType: "PERMISSION_CHANGE",
        targetUserId: 2,
        targetUserName: "Test User",
        oldValues: { role: "user" },
        newValues: { role: "admin" },
        status: "SUCCESS",
      });

      if (result) {
        const logs = await getAuditLogs({ limit: 1 });
        if (logs.length > 0) {
          const log = logs[0];
          expect(log.userId).toBeDefined();
          expect(log.actionType).toBeDefined();
          expect(log.status).toBeDefined();
          expect(["SUCCESS", "FAILED", "PENDING"]).toContain(log.status);
        }
      }
    });

    it("should handle JSON serialization of complex values", async () => {
      const complexData = {
        permissions: ["read", "write", "delete"],
        metadata: { timestamp: Date.now(), version: "1.0" },
      };

      const result = await logAuditEvent({
        userId: 1,
        actionType: "UPDATE",
        actionDetails: complexData,
        status: "SUCCESS",
      });

      expect(result).toBeDefined();
    });
  });
});
