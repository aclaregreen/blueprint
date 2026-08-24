import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type NutritionForm = {
  name: string;
  servingSizeGrams: number | null;
  calories: number | null;
  fats: number | null;
  carbs: number | null;
  protein: number | null;
};

export default function Foods() {
  const { session } = useAuth();

  const queryClient = useQueryClient();
  const [form, setForm] = useState<NutritionForm>({
    name: "",
    servingSizeGrams: null,
    calories: null,
    fats: null,
    carbs: null,
    protein: null,
  });
  const { data: food = [] } = useQuery({
    queryKey: ["food"],
    queryFn: async () => {
      //scoped to current user via RLS policy for food table
      const { data, error } = await supabase.from("food").select("*");
      if (error) throw error;
      return data;
    },
  });

  if (!session) return null;
  const userId = session.user.id;

  function toNumberOrNull(val: string) {
    return val === "" ? null : Number(val);
  }

  async function handleSave() {
    if (
      form.name.trim() === "" ||
      form.servingSizeGrams === null ||
      form.calories === null ||
      form.fats === null ||
      form.carbs === null ||
      form.protein === null
    ) {
      //add visual error
      return;
    }
    if (
      form.servingSizeGrams < 0 ||
      form.calories < 0 ||
      form.fats < 0 ||
      form.carbs < 0 ||
      form.protein < 0
    ) {
      //add visual error
      return;
    }
    const { error } = await supabase.from("food").insert({
      user_id: userId,
      name: form.name,
      serving_size_grams: form.servingSizeGrams,
      calories: form.calories,
      fats: form.fats,
      carbs: form.carbs,
      protein: form.protein,
    });

    if (error) {
      //error state and something else
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["food"] });
  }

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
          <Input
            value={form.name}
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            value={form.servingSizeGrams ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                servingSizeGrams: toNumberOrNull(e.target.value),
              })
            }
            placeholder="Serving Size Grams"
          />
          <Input
            type="number"
            min="0"
            value={form.calories ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                calories: toNumberOrNull(e.target.value),
              })
            }
            placeholder="Calories"
          />
          <Input
            type="number"
            min="0"
            value={form.fats ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                fats: toNumberOrNull(e.target.value),
              })
            }
            placeholder="Fats"
          />
          <Input
            type="number"
            min="0"
            value={form.carbs ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                carbs: toNumberOrNull(e.target.value),
              })
            }
            placeholder="Carbs"
          />
          <Input
            type="number"
            min="0"
            value={form.protein ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                protein: toNumberOrNull(e.target.value),
              })
            }
            placeholder="Protein"
          />

          <Button onClick={handleSave}>Save</Button>
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
