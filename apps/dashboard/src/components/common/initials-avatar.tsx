import { getInitials } from "@/utils/common";
import {
  Avatar,
  AvatarFallback,
  AvatarRootProps,
} from "@repo/ui/components/avatar";
import React from "react";

const InitialsAvatar = ({
  name,
  ...props
}: { name: string } & AvatarRootProps) => {
  return (
    <Avatar {...props}>
      <AvatarFallback className="text-xs bg-black text-white group-hover:text-white! font-medium rounded-md">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default InitialsAvatar;
