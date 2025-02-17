
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogOut, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setIsAdmin(data.role === "admin");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  if (isAdmin) {
    menuItems.push({ name: "Admin", href: "/admin" });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-accent">
              SweetCake
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "text-primary-foreground hover:text-accent transition-colors",
                  location.pathname === item.href && "text-accent"
                )}
              >
                {item.name}
              </a>
            ))}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/cart")}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <User className="h-5 w-5 text-primary-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-primary-foreground hover:text-accent transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden",
          isOpen ? "block" : "hidden",
          "border-b border-gray-100"
        )}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-primary-foreground hover:bg-secondary transition-colors",
                location.pathname === item.href && "bg-secondary"
              )}
            >
              {item.name}
            </a>
          ))}
          {user && (
            <a
              href="/my-orders"
              className={cn(
                "block px-3 py-2 rounded-md text-primary-foreground hover:bg-secondary transition-colors",
                location.pathname === "/my-orders" && "bg-secondary"
              )}
            >
              My Orders
            </a>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-primary-foreground hover:bg-secondary transition-colors"
            >
              Logout
            </button>
          ) : (
            <a
              href="/auth"
              className="block px-3 py-2 rounded-md text-primary-foreground hover:bg-secondary transition-colors"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
