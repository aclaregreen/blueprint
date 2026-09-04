import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toNumberOrNull } from "@/lib/helpers";
import { supabase } from "@/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

type MealFood = { foodId: string; portionSizeGrams: number };
type MealForm = {
  name: string;
  foods: MealFood[];
};

export default function Meals() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MealForm>({
    name: "",
    foods: [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedPortionSize, setSelectedPortionSize] = useState<number | null>(
    null,
  );
  // Passed to ComboboxContent's `container` prop below so the food-picker popup portals
  // inside this dialog instead of document.body — otherwise Radix's Dialog scroll-lock
  // blocks scrolling/clicking in it. See the `container` comment in components/ui/combobox.tsx.
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const { data: meals = [] } = useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("meal").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: foods = [] } = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("food").select("*");
      if (error) throw error;
      return data;
    },
  });

  if (!session) return null;
  const userId = session.user.id;

  function addFood() {
    if (!selectedFoodId || !selectedPortionSize || selectedPortionSize <= 0) {
      return;
    }
    if (form.foods.some((f) => f.foodId === selectedFoodId)) return;
    setForm({
      ...form,
      foods: [
        ...form.foods,
        { foodId: selectedFoodId, portionSizeGrams: selectedPortionSize },
      ],
    });
    setSelectedFoodId(null);
    setSelectedPortionSize(null);
  }

  async function handleSave() {
    if (formError) setFormError(null);
    if (form.name.trim() === "" || form.foods.length === 0) {
      setFormError("Missing required fields");
      return;
    }
    const { data, error } = await supabase
      .from("meal")
      .insert({
        name: form.name,
        user_id: userId,
      })
      .select("id")
      .single();
    if (error) {
      setFormError("Unable to create meal");
      return;
    }
    if (!data.id) {
      return;
    }
    for (const food of form.foods) {
      const { error } = await supabase.from("meal_food").insert({
        meal_id: data.id,
        food_id: food.foodId,
        portion_size_grams: food.portionSizeGrams,
      });
      if (error) {
        setFormError("Unable to add food to meal");
        return;
      }
    }
    queryClient.invalidateQueries({ queryKey: ["meals"] });

    setForm({
      name: "",
      foods: [],
    });
    setOpen(false);
  }
  return (
    <div className="page">
      <div className="page-header">
        <h1>Meals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Meal</Button>
          </DialogTrigger>
        <DialogContent ref={dialogContentRef} className="fullscreen-dialog translate-none">
          <DialogHeader>
            <DialogTitle>New Meal</DialogTitle>
          </DialogHeader>
          <div className="dialog-form">
            <Input
              className="dialog-input"
              value={form.name}
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <p className="dialog-section-label">Foods</p>
            <div className="dialog-fields">
              <Combobox
                items={foods}
                value={foods.find((f) => f.id === selectedFoodId) ?? null}
                onValueChange={(item) => setSelectedFoodId(item?.id ?? null)}
                itemToStringLabel={(item) => item.name}
              >
                <ComboboxInput
                  className="dialog-input"
                  placeholder="Search for foods..."
                  showClear
                />
                <ComboboxContent container={dialogContentRef}>
                  <ComboboxEmpty>No foods found</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.id} value={item}>
                        {item.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedFoodId && (
                <div className="dialog-fields">
                  <Input
                    className="dialog-input"
                    type="number"
                    min="0"
                    value={selectedPortionSize ?? ""}
                    onChange={(e) =>
                      setSelectedPortionSize(toNumberOrNull(e.target.value))
                    }
                    placeholder="Portion Size (g)"
                  />
                  <Button onClick={addFood}>Add to meal</Button>
                </div>
              )}
            </div>

            <div className="dialog-fields">
              {form.foods.map((item) => {
                const food = foods.find((f) => f.id === item.foodId);
                return (
                  <div key={item.foodId}>
                    {food?.name} - {item.portionSizeGrams}g
                  </div>
                );
              })}
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <Button className="dialog-button" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogContent>
        </Dialog>
      </div>

      <div className="list">
        {meals.length === 0 ? (
          <p className="list-empty">No meals yet</p>
        ) : (
          meals.map((m) => (
            <div key={m.id} className="list-row">
              <span className="list-row-name">{m.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
