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
    fats: null,
    carbs: null,
    protein: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
    if (formError) setFormError(null);
    if (
      form.name.trim() === "" ||
      form.servingSizeGrams === null ||
      form.fats === null ||
      form.carbs === null ||
      form.protein === null
    ) {
      setFormError("Missing required fields");
      return;
    }
    if (
      form.servingSizeGrams < 0 ||
      form.fats < 0 ||
      form.carbs < 0 ||
      form.protein < 0
    ) {
      setFormError("Nutrition fields can't be negative");
      return;
    }
    const { error } = await supabase.from("food").insert({
      user_id: userId,
      name: form.name,
      serving_size_grams: form.servingSizeGrams,
      fats: form.fats,
      carbs: form.carbs,
      protein: form.protein,
    });

    if (error) {
      setFormError(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["food"] });

    setForm({
      name: "",
      servingSizeGrams: null,
      fats: null,
      carbs: null,
      protein: null,
    });
    setOpen(false);
  }

  return (
    <div>
      <Label>Foods</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add Food</Button>
        </DialogTrigger>
        <DialogContent className="fullscreen-dialog">
          <DialogHeader>
            <DialogTitle>New Food</DialogTitle>
          </DialogHeader>
          <div className="food-form">
            <Input
              className="food-input"
              value={form.name}
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <p className="food-section-label">Nutrition</p>
            <div className="food-fields">
              <Input
                type="number"
                min="0"
                className="food-input"
                value={form.servingSizeGrams ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    servingSizeGrams: toNumberOrNull(e.target.value),
                  })
                }
                placeholder="Serving Size (g)"
              />
              <Input
                type="number"
                min="0"
                className="food-input"
                value={form.fats ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fats: toNumberOrNull(e.target.value),
                  })
                }
                placeholder="Fats (g)"
              />
              <Input
                type="number"
                min="0"
                className="food-input"
                value={form.carbs ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    carbs: toNumberOrNull(e.target.value),
                  })
                }
                placeholder="Carbs (g)"
              />
              <Input
                type="number"
                min="0"
                className="food-input"
                value={form.protein ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    protein: toNumberOrNull(e.target.value),
                  })
                }
                placeholder="Protein (g)"
              />
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <Button className="food-button" onClick={handleSave}>
              Save
            </Button>
          </div>
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
