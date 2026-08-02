import { Button } from "@repo/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@repo/ui/components/navigation-menu";
import Link from "next/link";
import {
  Book,
  BriefcaseBusiness,
  Cpu,
  DollarSign,
  FileText,
  Headset,
  HelpCircle,
  LucideIcon,
  Mail,
  User,
} from "lucide-react";
import { ThemeToggle } from "../theme-provider";

const solutions: {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Customer Support Agent",
    href: "/",
    description: "Instant answers, 24/7 support, and accurate responses.",
    icon: Headset,
  },
  {
    title: "Product Support Agent",
    href: "/",
    description: "Instant answers, 24/7 support, and accurate responses.",
    icon: HelpCircle,
  },
  {
    title: "Technical Support Agent",
    href: "/",
    description: "Instant answers, 24/7 support, and accurate responses.",
    icon: Cpu,
  },
  {
    title: "Sales Support Agent",
    href: "/",
    description: "Instant answers, 24/7 support, and accurate responses.",
    icon: DollarSign,
  },
  {
    title: "Marketing Support Agent",
    href: "/",
    description: "Instant answers, 24/7 support, and accurate responses.",
    icon: User,
  },
  {
    title: "HR Support Agent",
    href: "/",
    description: "Instant answers, 24/7 support, and accurate responses.",
    icon: BriefcaseBusiness,
  },
];
const resources: {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Documentation",
    href: "/docs",
    description: "Find in-depth information about our products.",
    icon: FileText,
  },
  {
    title: "Blog",
    href: "/blog",
    description: "Learn about our latest news and updates.",
    icon: Book,
  },
  {
    title: "FAQ",
    href: "/faq",
    description: "Frequently asked questions about our products.",
    icon: HelpCircle,
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Contact us for any questions or feedback.",
    icon: Mail,
  },
];

export function Nav() {
  return (
    <nav className="flex items-center gap-x-4 fixed top-0 z-10 bg-background p-4 inset-x-0 max-w-6xl mx-auto">
      <div className="flex-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support AI</h1>
        <NavigationMenu>
          <NavigationMenuList className="gap-x-4">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {solutions.map((solution) => (
                    <ListItem
                      key={solution.title}
                      href={solution.href}
                      title={solution.title}
                      icon={solution.icon}
                    >
                      {solution.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul>
                  {resources.map((resource) => (
                    <ListItem
                      key={resource.title}
                      href={resource.href}
                      title={resource.title}
                      icon={resource.icon}
                    >
                      {resource.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul>
                  {resources.map((resource) => (
                    <ListItem
                      key={resource.title}
                      href={resource.href}
                      title={resource.title}
                      icon={resource.icon}
                    >
                      {resource.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-x-4">
          <Button size="lg" variant="outline">Login</Button>
          <Button size="lg">Sign up</Button>
        </div>
      </div>
      <ThemeToggle iconOnly size="lg" />
    </nav>
  );
}

function ListItem({
  title,
  children,
  href,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; icon?: LucideIcon }) {
  return (
    <li {...props}>
      <NavigationMenuLink
        render={
          <Link href={href}>
            <div className="flex items-center gap-x-4">
              {Icon && (
                <span className="border flex items-center justify-center p-2 rounded-md w-10 h-10">
                  <Icon className="w-4 h-4" />
                </span>
              )}
              <div className="flex flex-col gap-1 text-sm">
                <div className="leading-none font-medium">{title}</div>
                <div className="line-clamp-2 text-muted-foreground text-sm">
                  {children}
                </div>
              </div>
            </div>
          </Link>
        }
      />
    </li>
  );
}
