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
      {food.length === 0 ? (
        <p>No foods yet</p>
      ) : (
        food.map((f) => <p key={f.id}>{f.name}</p>)
      )}
    </div>
  );
}
