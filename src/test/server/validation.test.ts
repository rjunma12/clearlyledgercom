import { describe, it, expect } from "vitest";
import {
  listJobsQuerySchema,
  jobIdParamSchema,
  updateJobBodySchema,
  processPdfBodySchema,
} from "../../../server/lib/validation";

describe("listJobsQuerySchema", () => {
  it("applies defaults when no params provided", () => {
    const result = listJobsQuerySchema.parse({});
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it("coerces string numbers from query params", () => {
    const result = listJobsQuerySchema.parse({ page: "3", limit: "50" });
    expect(result).toEqual({ page: 3, limit: 50 });
  });

  it("accepts valid status filter", () => {
    const result = listJobsQuerySchema.parse({ status: "completed" });
    expect(result.status).toBe("completed");
  });

  it("accepts all valid statuses", () => {
    for (const status of ["pending", "processing", "completed", "failed"]) {
      const result = listJobsQuerySchema.parse({ status });
      expect(result.status).toBe(status);
    }
  });

  it("rejects invalid status", () => {
    const result = listJobsQuerySchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects page < 1", () => {
    const result = listJobsQuerySchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = listJobsQuerySchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listJobsQuerySchema.safeParse({ page: "1.5" });
    expect(result.success).toBe(false);
  });
});

describe("jobIdParamSchema", () => {
  it("accepts a valid UUID", () => {
    const id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const result = jobIdParamSchema.parse({ id });
    expect(result.id).toBe(id);
  });

  it("rejects non-UUID strings", () => {
    expect(jobIdParamSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
    expect(jobIdParamSchema.safeParse({ id: "123" }).success).toBe(false);
    expect(jobIdParamSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(jobIdParamSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateJobBodySchema", () => {
  it("accepts valid status values", () => {
    for (const status of ["pending", "processing", "completed", "failed"]) {
      const result = updateJobBodySchema.parse({ status });
      expect(result.status).toBe(status);
    }
  });

  it("rejects invalid status", () => {
    expect(updateJobBodySchema.safeParse({ status: "cancelled" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateJobBodySchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string status", () => {
    expect(updateJobBodySchema.safeParse({ status: 123 }).success).toBe(false);
  });
});

describe("processPdfBodySchema", () => {
  it("applies defaults when empty", () => {
    const result = processPdfBodySchema.parse({});
    expect(result).toEqual({ locale: "auto", confidenceThreshold: 0.6, maxPages: 0 });
  });

  it("coerces string numbers from form data", () => {
    const result = processPdfBodySchema.parse({
      confidenceThreshold: "0.8",
      maxPages: "100",
    });
    expect(result.confidenceThreshold).toBe(0.8);
    expect(result.maxPages).toBe(100);
  });

  it("rejects confidenceThreshold > 1", () => {
    expect(processPdfBodySchema.safeParse({ confidenceThreshold: "1.5" }).success).toBe(false);
  });

  it("rejects confidenceThreshold < 0", () => {
    expect(processPdfBodySchema.safeParse({ confidenceThreshold: "-0.1" }).success).toBe(false);
  });

  it("rejects maxPages > 5000", () => {
    expect(processPdfBodySchema.safeParse({ maxPages: "5001" }).success).toBe(false);
  });

  it("rejects locale longer than 10 chars", () => {
    expect(processPdfBodySchema.safeParse({ locale: "a".repeat(11) }).success).toBe(false);
  });

  it("accepts valid locale", () => {
    const result = processPdfBodySchema.parse({ locale: "en-US" });
    expect(result.locale).toBe("en-US");
  });
});
