import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function Foods() {
  const { data: food = [] } = useQuery({
    queryKey: ["food"],
    queryFn: async () => {
      //scoped to current user via RLS policy for food table
      const { data, error } = await supabase.from("food").select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <Label>Foods</Label>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Food</Button>
        </DialogTrigger>
        <DialogContent className="fullscreen-dialog">
          <DialogHeader>
            <DialogTitle>New Food</DialogTitle>
          </DialogHeader>
          <p>add new food here</p>
        </DialogContent>
      </Dialog>

      {food.length === 0 ? (
        <p>No foods yet</p>
      ) : (
        food.map((f) => <p key={f.id}>{f.name}</p>)
      )}
    </div>
  );
}
