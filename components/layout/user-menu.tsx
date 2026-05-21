"use client";

import Link from "next/link";
import { Crown, LogOut, User, Clock, BookOpen } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Session } from "next-auth";

export function UserMenu({ session }: { session: Session }) {
  const user = session.user;
  const initials = (user.name ?? user.email ?? "U").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2.5 rounded-full px-1.5 py-1.5 sm:px-3">
          <Avatar className="size-9 ring-2 ring-border/60">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="size-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <AvatarFallback className="bg-accent/15 text-accent text-sm font-bold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-sm font-semibold leading-tight">{user.name ?? "Người dùng"}</span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              {user.isVip ? "VIP" : "Miễn phí"}
            </span>
          </div>
          {user.isVip ? (
            <Crown className="hidden size-3.5 text-amber-400 sm:block" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 ring-2 ring-border/50">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? ""}
                  className="size-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AvatarFallback className="bg-accent/15 text-accent text-base font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name ?? "Người dùng"}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                {user.isVip ? (
                  <Badge variant="accent" size="xs" className="inline-flex items-center gap-1">
                    <Crown className="size-3" />
                    VIP
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="xs">Miễn phí</Badge>
                )}
                {user.role === "ADMIN" ? (
                  <Badge variant="outline" size="xs">ADMIN</Badge>
                ) : null}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan" className="cursor-pointer">
            <User className="mr-2 size-4" />
            Tài khoản
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan?tab=history" className="cursor-pointer">
            <Clock className="mr-2 size-4" />
            Lịch sử nghe
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan?tab=follows" className="cursor-pointer">
            <BookOpen className="mr-2 size-4" />
            Truyện đang theo dõi
          </Link>
        </DropdownMenuItem>
        {!user.isVip ? (
          <DropdownMenuItem asChild>
            <Link href="/vip" className="cursor-pointer">
              <Crown className="mr-2 size-4" />
              Nâng cấp VIP
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
