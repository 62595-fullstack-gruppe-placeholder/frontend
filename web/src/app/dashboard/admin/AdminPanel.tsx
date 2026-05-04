"use client";

import { User } from "@/lib/repository/user/userSchemas";
import { useState, useTransition } from "react";
import { upgradeUserAction, downgradeUserAction, deleteUserAction } from "./adminActions";
import { toast } from "sonner";
import { ShieldCheck, Zap, ArrowDownCircle, Trash2 } from "lucide-react";

export function AdminPanel({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();

  function handleUpgrade(userId: string) {
    startTransition(async () => {
      try {
        await upgradeUserAction(userId);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, tier: "pro" } : u))
        );
        toast.success("User upgraded to pro");
      } catch {
        toast.error("Failed to upgrade user");
      }
    });
  }

  function handleDelete(userId: string) {
    startTransition(async () => {
      try {
        await deleteUserAction(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success("User deleted");
      } catch {
        toast.error("Failed to delete user");
      }
    });
  }

  function handleDowngrade(userId: string) {
    startTransition(async () => {
      try {
        await downgradeUserAction(userId);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, tier: "free" } : u))
        );
        toast.success("User downgraded to free");
      } catch {
        toast.error("Failed to downgrade user");
      }
    });
  }

  return (
    <div className="w-full flex flex-col items-center py-12 px-4 space-y-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-secondary/10 pb-6">
          <div className="p-3 bg-button-main/20 rounded-xl">
            <ShieldCheck className="text-button-main" size={32} />
          </div>
          <div>
            <h1 className="h1">Admin panel</h1>
            <p className="text-secondary font-mono text-sm">
              {users.length} user{users.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="box border border-secondary/10 overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-secondary/10 text-left">
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-secondary">Email</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-secondary">Tier</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-secondary">Confirmed</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-secondary">Admin</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-secondary/5 hover:bg-text-main/5 transition-colors">
                  <td className="px-4 py-3 text-text-main">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                        u.tier === "pro"
                          ? "bg-button-main/20 text-button-main"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {u.email_confirmed ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {u.is_admin ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    {!u.is_admin && (
                      <div className="flex gap-2">
                        {u.tier === "free" ? (
                          <button
                            onClick={() => handleUpgrade(u.id)}
                            disabled={isPending}
                            className="box flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider
                                       bg-button-main/20 hover:bg-button-main/30 border border-button-main/30
                                       hover:border-button-main text-button-main transition-all disabled:opacity-50"
                          >
                            <Zap size={12} />
                            Upgrade
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDowngrade(u.id)}
                            disabled={isPending}
                            className="box flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider
                                       bg-secondary/10 hover:bg-secondary/20 border border-secondary/20
                                       hover:border-secondary/40 text-secondary transition-all disabled:opacity-50"
                          >
                            <ArrowDownCircle size={12} />
                            Downgrade
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={isPending}
                          className="box flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider
                                     bg-destructive/20 hover:bg-destructive/30 border border-destructive/30
                                     hover:border-destructive text-destructive transition-all disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
