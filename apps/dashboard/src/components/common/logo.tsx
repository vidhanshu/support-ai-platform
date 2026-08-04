import { cn } from "@repo/ui/lib/utils";
import React from "react";

const Logo = ({className}: {className?: string}) => {
  return <h1 className={cn("text-2xl font-bold", className)}>Support AI</h1>;
};

export default Logo;
