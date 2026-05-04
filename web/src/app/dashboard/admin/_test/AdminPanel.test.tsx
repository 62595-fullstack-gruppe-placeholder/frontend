import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { AdminPanel } from "../AdminPanel";
import * as adminActions from "../adminActions";
import { User } from "@/lib/repository/user/userSchemas";

vi.mock("../adminActions");
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const freeUser: User = {
  id: "free-user-id",
  email: "free@example.com",
  email_confirmed: true,
  tier: "free",
  is_admin: false,
  settings: null,
};

const proUser: User = {
  id: "pro-user-id",
  email: "pro@example.com",
  email_confirmed: true,
  tier: "pro",
  is_admin: false,
  settings: null,
};

const adminUser: User = {
  id: "admin-user-id",
  email: "admin@admin.com",
  email_confirmed: true,
  tier: "pro",
  is_admin: true,
  settings: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  (adminActions.upgradeUserAction as any).mockResolvedValue(undefined);
  (adminActions.downgradeUserAction as any).mockResolvedValue(undefined);
  (adminActions.deleteUserAction as any).mockResolvedValue(undefined);
});

describe("AdminPanel", () => {
  it("renders all users", () => {
    const screen = render(<AdminPanel users={[freeUser, proUser, adminUser]} />);

    expect(screen.getByText("free@example.com")).toBeInTheDocument();
    expect(screen.getByText("pro@example.com")).toBeInTheDocument();
    expect(screen.getByText("admin@admin.com")).toBeInTheDocument();
  });

  it("shows correct user count", () => {
    const screen = render(<AdminPanel users={[freeUser, proUser]} />);
    expect(screen.getByText("2 users registered")).toBeInTheDocument();
  });

  it("shows singular user count for one user", () => {
    const screen = render(<AdminPanel users={[freeUser]} />);
    expect(screen.getByText("1 user registered")).toBeInTheDocument();
  });

  it("shows Upgrade button for free users", () => {
    const screen = render(<AdminPanel users={[freeUser]} />);
    expect(screen.getByRole("button", { name: /upgrade/i })).toBeInTheDocument();
  });

  it("shows Downgrade button for pro users", () => {
    const screen = render(<AdminPanel users={[proUser]} />);
    expect(screen.getByRole("button", { name: /downgrade/i })).toBeInTheDocument();
  });

  it("shows no action buttons for admin users", () => {
    const screen = render(<AdminPanel users={[adminUser]} />);
    expect(screen.queryByRole("button", { name: /upgrade/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /downgrade/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("calls upgradeUserAction and updates tier to pro on upgrade", async () => {
    const screen = render(<AdminPanel users={[freeUser]} />);

    fireEvent.click(screen.getByRole("button", { name: /upgrade/i }));

    await waitFor(() => {
      expect(adminActions.upgradeUserAction).toHaveBeenCalledWith(freeUser.id);
    });

    // After upgrade, Downgrade button should appear instead
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /downgrade/i })).toBeInTheDocument();
    });
  });

  it("calls downgradeUserAction and updates tier to free on downgrade", async () => {
    const screen = render(<AdminPanel users={[proUser]} />);

    fireEvent.click(screen.getByRole("button", { name: /downgrade/i }));

    await waitFor(() => {
      expect(adminActions.downgradeUserAction).toHaveBeenCalledWith(proUser.id);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /upgrade/i })).toBeInTheDocument();
    });
  });

  it("calls deleteUserAction and removes user from table on delete", async () => {
    const screen = render(<AdminPanel users={[freeUser]} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(adminActions.deleteUserAction).toHaveBeenCalledWith(freeUser.id);
    });

    await waitFor(() => {
      expect(screen.queryByText("free@example.com")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when upgrade fails", async () => {
    const { toast } = await import("sonner");
    (adminActions.upgradeUserAction as any).mockRejectedValue(new Error("Failed"));

    const screen = render(<AdminPanel users={[freeUser]} />);
    fireEvent.click(screen.getByRole("button", { name: /upgrade/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to upgrade user");
    });
  });

  it("shows error toast when downgrade fails", async () => {
    const { toast } = await import("sonner");
    (adminActions.downgradeUserAction as any).mockRejectedValue(new Error("Failed"));

    const screen = render(<AdminPanel users={[proUser]} />);
    fireEvent.click(screen.getByRole("button", { name: /downgrade/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to downgrade user");
    });
  });

  it("shows error toast when delete fails", async () => {
    const { toast } = await import("sonner");
    (adminActions.deleteUserAction as any).mockRejectedValue(new Error("Failed"));

    const screen = render(<AdminPanel users={[freeUser]} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to delete user");
    });
  });

  it("displays email_confirmed as Yes/No correctly", () => {
    const unconfirmed = { ...freeUser, id: "x", email: "x@x.com", email_confirmed: false };
    const screen = render(<AdminPanel users={[freeUser, unconfirmed]} />);

    const cells = screen.getAllByText("Yes");
    expect(cells.length).toBeGreaterThan(0);
    expect(screen.getByText("No")).toBeInTheDocument();
  });
});
