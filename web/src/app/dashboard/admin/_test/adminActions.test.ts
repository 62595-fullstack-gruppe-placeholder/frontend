import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authModule from "@/lib/auth/userFromToken";
import * as userRepoModule from "@/lib/repository/user/userRepository";

vi.mock("@/lib/auth/userFromToken");
vi.mock("@/lib/repository/user/userRepository");
vi.mock("server-only", () => ({}));

const mockAdmin = { id: "admin-id", is_admin: true };
const mockNonAdmin = { id: "user-id", is_admin: false };

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({ ok: true });
});

describe("getAllUsersAction", () => {
  it("returns all users when called by admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    (userRepoModule.getAllUsers as any).mockResolvedValue([{ id: "u1" }, { id: "u2" }]);

    const { getAllUsersAction } = await import("../adminActions");
    const result = await getAllUsersAction();

    expect(userRepoModule.getAllUsers).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it("throws Unauthorized when called by non-admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockNonAdmin);

    const { getAllUsersAction } = await import("../adminActions");
    await expect(getAllUsersAction()).rejects.toThrow("Unauthorized");
    expect(userRepoModule.getAllUsers).not.toHaveBeenCalled();
  });

  it("throws Unauthorized when not logged in", async () => {
    (authModule.getUser as any).mockResolvedValue(null);

    const { getAllUsersAction } = await import("../adminActions");
    await expect(getAllUsersAction()).rejects.toThrow("Unauthorized");
  });
});

describe("upgradeUserAction", () => {
  it("calls scraper upgrade endpoint with userId", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);

    const { upgradeUserAction } = await import("../adminActions");
    await upgradeUserAction("target-user-id");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://scraper:5001/admin/upgrade",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "target-user-id" }),
      })
    );
  });

  it("throws Unauthorized when called by non-admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockNonAdmin);

    const { upgradeUserAction } = await import("../adminActions");
    await expect(upgradeUserAction("target-user-id")).rejects.toThrow("Unauthorized");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("throws when scraper returns non-ok response", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    mockFetch.mockResolvedValue({ ok: false });

    const { upgradeUserAction } = await import("../adminActions");
    await expect(upgradeUserAction("target-user-id")).rejects.toThrow("Failed to upgrade user");
  });
});

describe("downgradeUserAction", () => {
  it("calls scraper downgrade endpoint with userId", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);

    const { downgradeUserAction } = await import("../adminActions");
    await downgradeUserAction("target-user-id");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://scraper:5001/admin/downgrade",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "target-user-id" }),
      })
    );
  });

  it("throws Unauthorized when called by non-admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockNonAdmin);

    const { downgradeUserAction } = await import("../adminActions");
    await expect(downgradeUserAction("target-user-id")).rejects.toThrow("Unauthorized");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("throws when scraper returns non-ok response", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    mockFetch.mockResolvedValue({ ok: false });

    const { downgradeUserAction } = await import("../adminActions");
    await expect(downgradeUserAction("target-user-id")).rejects.toThrow("Failed to downgrade user");
  });
});

describe("deleteUserAction", () => {
  it("deletes user when called by admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    (userRepoModule.deleteUser as any).mockResolvedValue(undefined);

    const { deleteUserAction } = await import("../adminActions");
    await deleteUserAction("target-user-id");

    expect(userRepoModule.deleteUser).toHaveBeenCalledWith("target-user-id");
  });

  it("throws Unauthorized when called by non-admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockNonAdmin);

    const { deleteUserAction } = await import("../adminActions");
    await expect(deleteUserAction("target-user-id")).rejects.toThrow("Unauthorized");
    expect(userRepoModule.deleteUser).not.toHaveBeenCalled();
  });

  it("throws when admin tries to delete their own account", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);

    const { deleteUserAction } = await import("../adminActions");
    await expect(deleteUserAction(mockAdmin.id)).rejects.toThrow("Cannot delete your own account");
    expect(userRepoModule.deleteUser).not.toHaveBeenCalled();
  });

  it("throws Unauthorized when not logged in", async () => {
    (authModule.getUser as any).mockResolvedValue(null);

    const { deleteUserAction } = await import("../adminActions");
    await expect(deleteUserAction("target-user-id")).rejects.toThrow("Unauthorized");
  });
});
