"use client";

import { Button } from "@repo/ui/components/button";
import Image from "next/image";

type NotFoundProps = {
  onCreateClick?: () => void;
};

export default function NotFound({ onCreateClick }: NotFoundProps) {
  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <Image
          src="/no-agents.webp"
          alt="No agents"
          fill
          className="object-contain"
        />
      </div>
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-center text-xl font-bold">No Agents yet...</h1>
        <p className="text-center text-muted-foreground">
          Create your first AI Agent to start automating support, generating
          leads, and answering customer questions.
        </p>
        <Button
          className="mx-auto block"
          size="xl"
          type="button"
          onClick={onCreateClick}
        >
          Create Agent
        </Button>
      </div>
    </div>
  );
}
