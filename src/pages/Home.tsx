import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Square } from "lucide-react";

export default function Home() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data: meals = [] } = useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("meal").select("*");
      if (error) throw error;
      return data;
    },
  });
  const { data: mealFoods = [] } = useQuery({
    queryKey: ["mealFoods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_food")
        .select("meal_id, portion_size_grams, food:food_id(*)");
      if (error) throw error;
      return data;
    },
  });
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ["diaryEntries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_entry")
        .select("*")
        .gte("logged_at", startOfToday.toISOString())
        .lt("logged_at", endOfToday.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const dailyTotals = diaryEntries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      fats: totals.fats + entry.fats,
      carbs: totals.carbs + entry.carbs,
      protein: totals.protein + entry.protein,
    }),
    { calories: 0, fats: 0, carbs: 0, protein: 0 },
  );

  if (!session) return null;
  const userId = session.user.id;

  type MealFoodRow = (typeof mealFoods)[number];

  function checkMealCompletionStatus(mealId: string, mealFoods: MealFoodRow[]) {
    return mealFoods.every((mf) =>
      diaryEntries.find(
        (d) => d.meal_id === mealId && d.food_id === mf.food.id,
      ),
    );
  }

  function checkCompletionStatus(mealId: string, mealFood: MealFoodRow) {
    return diaryEntries.find(
      (d) => d.meal_id === mealId && d.food_id === mealFood.food.id,
    );
  }
  async function toggleMeal(
    mealId: string,
    mealFoods: MealFoodRow[],
    isCompleted: boolean,
  ) {
    await Promise.all(
      mealFoods.map(async (mf) => {
        const entry = checkCompletionStatus(mealId, mf);
        if (isCompleted) {
          if (entry) await toggleFood(mealId, mf, entry);
        } else {
          if (!entry) await toggleFood(mealId, mf, entry);
        }
      }),
    );
  }
  async function toggleFood(
    mealId: string,
    mealFood: MealFoodRow,
    loggedEntry: ReturnType<typeof checkCompletionStatus>,
  ) {
    if (loggedEntry) {
      const { error } = await supabase
        .from("diary_entry")
        .delete()
        .eq("id", loggedEntry.id);
      if (error) return;
    } else {
      const multiplier =
        mealFood.portion_size_grams / mealFood.food.serving_size_grams;
      const { error } = await supabase.from("diary_entry").insert({
        user_id: userId,
        meal_id: mealId,
        food_id: mealFood.food.id,
        portion_size_grams: mealFood.portion_size_grams,
        calories: (mealFood.food.calories ?? 0) * multiplier,
        fats: mealFood.food.fats * multiplier,
        carbs: mealFood.food.carbs * multiplier,
        protein: mealFood.food.protein * multiplier,
      });
      if (error) return;
    }
    queryClient.invalidateQueries({ queryKey: ["diaryEntries"] });
  }
  return (
    <div>
      <h1>Blueprint</h1>
      {dailyTotals.calories} {dailyTotals.carbs} {dailyTotals.fats}{" "}
      {dailyTotals.protein}
      <div>
        {meals.map((m) => {
          const mealFoodsForThisMeal = mealFoods.filter(
            (mf) => mf.meal_id === m.id,
          );
          const loggedCount = mealFoodsForThisMeal.filter((mf) =>
            diaryEntries.some(
              (d) => d.meal_id === m.id && d.food_id === mf.food.id,
            ),
          ).length;
          const mealCompleted = checkMealCompletionStatus(
            m.id,
            mealFoodsForThisMeal,
          );
          return (
            <div key={m.id}>
              <Button
                variant="ghost"
                onClick={() =>
                  toggleMeal(m.id, mealFoodsForThisMeal, mealCompleted)
                }
              >
                {mealCompleted ? <Check /> : <Square />}
                <p>
                  {m.name} ({loggedCount}/{mealFoodsForThisMeal.length})
                </p>
              </Button>

              {mealFoodsForThisMeal.map((mf) => {
                const loggedEntry = checkCompletionStatus(m.id, mf);
                return (
                  <Button
                    key={mf.food.id}
                    variant="ghost"
                    onClick={() => toggleFood(m.id, mf, loggedEntry)}
                  >
                    {loggedEntry ? <Check /> : <Square />}
                    <p>{mf.food.name}</p>
                    <p>
                      {(mf.food.calories ?? 0) *
                        (mf.portion_size_grams / mf.food.serving_size_grams)}
                    </p>
                  </Button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
