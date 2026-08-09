import Link from "next/link";

const links = {
  Product: [
    { label: "Solutions", href: "#solutions" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
        <div className="space-y-3">
          <p className="text-2xl font-bold">Support AI</p>
          <p className="text-sm font-medium text-muted-foreground">
            Conversational agents for modern customer experience.
          </p>
        </div>

        {Object.entries(links).map(([group, items]) => (
          <div key={group} className="space-y-3">
            <p className="text-sm font-bold tracking-wide uppercase">
              {group}
            </p>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm font-medium text-muted-foreground lg:px-12">
          <p>© {new Date().getFullYear()} Support AI</p>
          <p>Built for teams that care about answers</p>
        </div>
      </div>
    </footer>
  );
}
