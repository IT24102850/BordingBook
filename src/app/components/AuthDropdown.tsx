import React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { User } from 'lucide-react';

export function AuthDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="glassmorphism group p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <User className="w-7 h-7 text-cyan-400 group-hover:text-purple-400 transition-colors duration-200" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[120px] bg-white/80 backdrop-blur-xl border border-cyan-200 shadow-xl rounded-xl p-2 animate-fade-in">
        <DropdownMenuItem className="font-semibold text-cyan-700 hover:bg-cyan-50 rounded-lg transition">Sign In</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition">Sign Up</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
