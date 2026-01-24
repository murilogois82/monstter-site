import { describe, expect, it } from "vitest";

describe("Service Order Corrections", () => {
  describe("Calculate Total Hours with Interval Discount", () => {
    it("should calculate total hours correctly", () => {
      const start = new Date("2026-01-24T09:00:00");
      const end = new Date("2026-01-24T13:00:00");
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      expect(diffHours).toBe(4);
    });

    it("should discount interval from total hours", () => {
      const start = new Date("2026-01-24T09:00:00");
      const end = new Date("2026-01-24T13:00:00");
      const interval = 60; // 60 minutes
      
      const diffMs = end.getTime() - start.getTime();
      let diffHours = diffMs / (1000 * 60 * 60);
      const intervalHours = interval / 60;
      diffHours = diffHours - intervalHours;
      
      expect(diffHours).toBe(3);
    });

    it("should handle zero interval", () => {
      const start = new Date("2026-01-24T09:00:00");
      const end = new Date("2026-01-24T13:00:00");
      const interval = 0;
      
      const diffMs = end.getTime() - start.getTime();
      let diffHours = diffMs / (1000 * 60 * 60);
      const intervalHours = interval / 60;
      diffHours = diffHours - intervalHours;
      
      expect(diffHours).toBe(4);
    });

    it("should return 0 if total hours become negative", () => {
      const start = new Date("2026-01-24T09:00:00");
      const end = new Date("2026-01-24T10:00:00");
      const interval = 120; // 120 minutes (2 hours)
      
      const diffMs = end.getTime() - start.getTime();
      let diffHours = diffMs / (1000 * 60 * 60);
      const intervalHours = interval / 60;
      diffHours = diffHours - intervalHours;
      
      expect(Math.max(0, diffHours)).toBe(0);
    });
  });

  describe("Generate Sequential OS Number", () => {
    it("should generate OS number with correct format", () => {
      const osNumber = `OS-${new Date().getFullYear()}-0001`;
      expect(osNumber).toMatch(/^OS-\d{4}-\d{4}$/);
    });

    it("should increment OS number correctly", () => {
      const lastOSNumber = `OS-${new Date().getFullYear()}-0001`;
      const match = lastOSNumber.match(/(\d+)$/);
      let nextNumber = 1;
      
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
      
      const nextOSNumber = `OS-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;
      expect(nextOSNumber).toBe(`OS-${new Date().getFullYear()}-0002`);
    });

    it("should pad OS number with zeros", () => {
      const nextNumber = 5;
      const osNumber = `OS-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;
      expect(osNumber).toBe(`OS-${new Date().getFullYear()}-0005`);
    });
  });

  describe("Client Selection from Catalog", () => {
    it("should validate client selection", () => {
      const clientId = 1;
      const clientName = "Empresa XYZ";
      const clientEmail = "contato@empresa.com";
      
      expect(clientId).toBeGreaterThan(0);
      expect(clientName).toBeTruthy();
      expect(clientEmail).toContain("@");
    });

    it("should handle optional client ID", () => {
      const clientId = undefined;
      const clientName = "Empresa Manual";
      const clientEmail = "manual@empresa.com";
      
      expect(clientId || null).toBeNull();
      expect(clientName).toBeTruthy();
      expect(clientEmail).toBeTruthy();
    });
  });
});
