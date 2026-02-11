import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/lib/contact-schema";

describe("contactFormSchema", () => {
  it("accepts valid form data", () => {
    const result = contactFormSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      message: "Hello, I have a question about your pricing plans.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = contactFormSchema.safeParse({
      name: "",
      email: "john@example.com",
      message: "Hello, I have a question.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = contactFormSchema.safeParse({
      name: "J",
      email: "john@example.com",
      message: "Hello, I have a question.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactFormSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      message: "Hello, I have a question.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = contactFormSchema.safeParse({
      name: "John Doe",
      email: "",
      message: "Hello, I have a question.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message shorter than 10 characters", () => {
    const result = contactFormSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      message: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message longer than 5000 characters", () => {
    const result = contactFormSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      message: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from fields", () => {
    const result = contactFormSchema.safeParse({
      name: "  John Doe  ",
      email: "  john@example.com  ",
      message: "  Hello, I have a question about your plans.  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
      expect(result.data.email).toBe("john@example.com");
      expect(result.data.message).toBe(
        "Hello, I have a question about your plans.",
      );
    }
  });
});
