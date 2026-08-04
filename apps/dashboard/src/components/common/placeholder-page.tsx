export function PlaceholderPage({
  title,
  description = "This page is a placeholder and will be implemented next.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
