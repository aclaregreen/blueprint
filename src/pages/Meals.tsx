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

  async function handleSave() {
    //add save logic
  }
  return (
    <div>
      <h1>Meals</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add Meal</Button>
        </DialogTrigger>
        <DialogContent ref={dialogContentRef} className="fullscreen-dialog">
          <DialogHeader>
            <DialogTitle>New Meal</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              value={form.name}
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Combobox
              items={foods}
              value={foods.find((f) => f.id === selectedFoodId) ?? null}
              onValueChange={(item) => setSelectedFoodId(item?.id ?? null)}
            >
              <ComboboxInput placeholder="Search for foods..." showClear />
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
              <div>
                <Input
                  value={selectedPortionSize ?? ""}
                  onChange={(e) => toNumberOrNull(e.target.value)}
                  placeholder="Portion Size (g)"
                />{" "}
                <Button>Add to meal</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div>
        {meals.length === 0 ? (
          <p>No meals yet</p>
        ) : (
          meals.map((m) => <div key={m.id}>{m.name}</div>)
        )}
      </div>
    </div>
  );
}
