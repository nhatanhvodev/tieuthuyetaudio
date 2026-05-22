import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountPageClient } from "@/components/account/account-page-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

const account = {
  id: "user-1",
  email: "user@example.com",
  name: "User",
  image: null,
  role: "USER",
  isVip: false,
  createdAt: new Date("2024-01-01T00:00:00.000Z")
};

const history = [
  {
    id: "history-1",
    currentSeconds: 120,
    completed: false,
    episode: {
      id: "episode-1",
      episodeNumber: 1,
      title: "Tap 1",
      audioUrl: "/audio/tap-1.mp3",
      durationSeconds: 600,
      series: {
        id: "series-1",
        slug: "truyen-demo",
        title: "Truyen demo",
        coverUrl: null
      }
    }
  }
];

describe("AccountPageClient", () => {
  it("omits the top continue listening shelf while keeping listening history actions", () => {
    render(
      React.createElement(AccountPageClient as React.ComponentType<Record<string, unknown>>, {
        tab: "history",
        account,
        history,
        follows: []
      })
    );

    expect(screen.queryByRole("heading", { name: /Nghe ti/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Truyen demo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nghe ti/i })).toBeInTheDocument();
  });
});
