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
  const initials = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2">
          <Avatar className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{user.name ?? user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2">
            <Avatar className="size-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-none">{user.name ?? user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {user.isVip ? (
            <Badge variant="accent" className="mt-2">
              <Crown className="mr-1 size-3" />
              VIP
            </Badge>
          ) : null}
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
