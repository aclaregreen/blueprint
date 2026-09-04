import { Button } from "@/components/ui/button";
import { Apple, ForkKnife, Home } from "lucide-react";
import { useNavigate } from "react-router";

export default function BottomNav() {
  const navigate = useNavigate();
  return (
    <div className="bottom-nav">
      <Button
        variant="ghost"
        className="bottom-nav-button"
        onClick={() => navigate("/")}
      >
        <Home />
      </Button>
      <Button
        variant="ghost"
        className="bottom-nav-button"
        onClick={() => navigate("/meals")}
      >
        <ForkKnife />
      </Button>
      <Button
        variant="ghost"
        className="bottom-nav-button"
        onClick={() => navigate("/foods")}
      >
        <Apple />
      </Button>
    </div>
  );
}
