"use client";

import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/forms/Checkbox";
import Input from "@/components/ui/forms/Input";
import { app, auth } from "@/lib/firebase/config";
import { useConstantsStore } from "@/lib/store/constStore";
import { usePlanStore } from "@/lib/store/planStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";

// TODO some text changes

const settingsSchema = z.object({
  year: z.coerce
    .number({
      invalid_type_error: "Please enter a number",
    })
    .gte(1900, "Please enter a valid year")
    .lte(2100, "Please enter a valid year"),
  units: z.coerce
    .number({
      invalid_type_error: "Please enter a number",
    })
    .gte(0, "Please enter a valid amount")
    .lte(300, "Please enter a valid amount"),
  show_arrows: z.boolean(),
  animate: z.boolean(),
  show_select: z.boolean(),
  ignore_units: z.boolean(),
  ignore_reqs: z.boolean(),
  ignore_offer: z.boolean(),
});

type settingsSchemaType = z.infer<typeof settingsSchema>;

export default function Settings() {
  const plan = usePlanStore((state) => state.plan);
  const setPlan = usePlanStore((state) => state.setPlan);
  const settings = useConstantsStore((state) => state.settings);
  const setSettings = useConstantsStore((state) => state.setSettings);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<settingsSchemaType>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      year: plan?.year,
      units: plan?.total_units,
      ...settings,
    },
  });

  const [user] = useAuthState(auth);
  const db = getFirestore(app);

  const saveSettings = async (
    s: {
      show_arrows: boolean;
      animate: boolean;
      show_select: boolean;
      ignore_units: boolean;
      ignore_reqs: boolean;
      ignore_offer: boolean;
    },
    year: number,
    units: number,
  ) => {
    try {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          settings: s,
          plan: {
            year: year,
            total_units: units,
          },
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Error saving settings: ", error);
    }
  };

  const onSubmit = async (data: settingsSchemaType) => {
    if (!plan) return;
    setPlan({ ...plan, year: data.year, total_units: data.units });
    const s = {
      show_arrows: data.show_arrows,
      animate: data.animate,
      show_select: data.show_select,
      ignore_units: data.ignore_units,
      ignore_reqs: data.ignore_reqs,
      ignore_offer: data.ignore_offer,
    };
    setSettings(s);
    await saveSettings(s, data.year, data.units);
    reset({
      year: data.year,
      units: data.units,
      show_arrows: data.show_arrows,
      animate: data.animate,
      show_select: data.show_select,
      ignore_units: data.ignore_units,
      ignore_reqs: data.ignore_reqs,
      ignore_offer: data.ignore_offer,
    });
  };

  return (
    <div className="mt-5 flex w-full justify-center">
      <div className="flex w-[700px] flex-col">
        <div className="text-3xl font-light">Settings</div>
        <div className="">
          <form
            id="settings"
            onSubmit={handleSubmit(onSubmit)}
            className="my-6 rounded border-2 border-zinc-200 dark:border-zinc-800"
          >
            <div className="grid grid-cols-12 gap-y-2 p-8 md:gap-y-8">
              <div className="col-span-12 text-lg md:col-span-5">
                Plan details
              </div>
              <div className="col-span-12 flex flex-col gap-2 md:col-span-7">
                <Input
                  {...register("year")}
                  error={errors.year?.message}
                  label="Year started"
                  width="col-span-3"
                />
                <Input
                  {...register("units")}
                  error={errors.units?.message}
                  label="Total units"
                  width="col-span-3"
                />
              </div>
              <div className="col-span-12 text-lg md:col-span-5">
                Display settings
              </div>
              <div className="col-span-12 flex flex-col gap-2 md:col-span-7">
                <div className="my-2 flex flex-col gap-4">
                  <Checkbox
                    {...register("show_arrows")}
                    label="Show course connection"
                    width="col-span-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-500">
                      This setting will display arrows that show how courses are
                      related. These arrows will help you understand which
                      courses you need to take before others (prerequisites).
                    </span>
                  </div>
                </div>
                <div className="my-2 flex flex-col gap-4">
                  <Checkbox
                    {...register("animate")}
                    label="Animate course connections"
                    width="col-span-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-500">
                      Turn this on to animate the path of the arrows when you
                      select a course. This can make it easier to follow the
                      connections between courses.{" "}
                    </span>
                  </div>
                </div>
                <div className="my-2 flex flex-col gap-4">
                  <Checkbox
                    {...register("show_select")}
                    label="Show arrows for selected course only"
                    width="col-span-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-500">
                      Only show the arrows connected to the course you currently
                      have selected.
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 text-lg md:col-span-5">
                Warning settings
              </div>
              <div className="col-span-12 flex flex-col gap-2 md:col-span-7">
                <div className="my-2 flex flex-col gap-4">
                  <Checkbox
                    {...register("ignore_units")}
                    label="Ignore unit warnings"
                    width="col-span-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-500">
                      This setting will hide warnings that appear when a
                      semester has too few or too many units
                    </span>
                  </div>
                </div>
                <div className="my-2 flex flex-col gap-4">
                  <Checkbox
                    {...register("ignore_reqs")}
                    label="Ignore requisite warnings"
                    width="col-span-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-500">
                      This will hide warnings about missing prerequisites for
                      courses.
                    </span>
                  </div>
                </div>
                <div className="my-2 flex flex-col gap-4">
                  <Checkbox
                    {...register("ignore_offer")}
                    label="Ignore semesters offered warnings"
                    width="col-span-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-500">
                      <p>
                        Enable this setting to hide warnings that a course might
                        not be offered in the semester where it is placed.
                      </p>
                      <p>
                        <span className="font-bold">Be Aware: </span>
                        {
                          "The course data might not be entirely accurate. It's recommended to check with your school for the latest course offerings"
                        }
                      </p>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 flex justify-end gap-3">
                <Button
                  disabled={!isDirty || isSubmitting}
                  type="submit"
                  variant="primary"
                  size="lg"
                >
                  Save
                </Button>
                <Button
                  onClick={() => reset()}
                  disabled={!isDirty}
                  type="button"
                  variant="base"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
