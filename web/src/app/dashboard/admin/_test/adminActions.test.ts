import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authModule from "@/lib/auth/userFromToken";
import * as userRepoModule from "@/lib/repository/user/userRepository";

vi.mock("@/lib/auth/userFromToken");
vi.mock("@/lib/repository/user/userRepository");
vi.mock("server-only", () => ({}));

const mockAdmin = { id: "admin-id", is_admin: true };
const mockNonAdmin = { id: "user-id", is_admin: false };

beforeEach(() => {
  vi.clearAllMocks();
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
  it("calls setUserTier with pro for userId", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    (userRepoModule.setUserTier as any).mockResolvedValue(true);

    const { upgradeUserAction } = await import("../adminActions");
    await upgradeUserAction("target-user-id");

    expect(userRepoModule.setUserTier).toHaveBeenCalledWith("target-user-id", "pro");
  });

  it("throws Unauthorized when called by non-admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockNonAdmin);

    const { upgradeUserAction } = await import("../adminActions");
    await expect(upgradeUserAction("target-user-id")).rejects.toThrow("Unauthorized");
    expect(userRepoModule.setUserTier).not.toHaveBeenCalled();
  });

  it("throws when user not found", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    (userRepoModule.setUserTier as any).mockResolvedValue(false);

    const { upgradeUserAction } = await import("../adminActions");
    await expect(upgradeUserAction("target-user-id")).rejects.toThrow("User not found");
  });
});

describe("downgradeUserAction", () => {
  it("calls setUserTier with free for userId", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    (userRepoModule.setUserTier as any).mockResolvedValue(true);

    const { downgradeUserAction } = await import("../adminActions");
    await downgradeUserAction("target-user-id");

    expect(userRepoModule.setUserTier).toHaveBeenCalledWith("target-user-id", "free");
  });

  it("throws Unauthorized when called by non-admin", async () => {
    (authModule.getUser as any).mockResolvedValue(mockNonAdmin);

    const { downgradeUserAction } = await import("../adminActions");
    await expect(downgradeUserAction("target-user-id")).rejects.toThrow("Unauthorized");
    expect(userRepoModule.setUserTier).not.toHaveBeenCalled();
  });

  it("throws when user not found", async () => {
    (authModule.getUser as any).mockResolvedValue(mockAdmin);
    (userRepoModule.setUserTier as any).mockResolvedValue(false);

    const { downgradeUserAction } = await import("../adminActions");
    await expect(downgradeUserAction("target-user-id")).rejects.toThrow("User not found");
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
