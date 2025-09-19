"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchRewardPrograms } from "@/store/slices/rewardSlice";
import RewardProgramTable from "./RewardProgramTable";

export default function Rewards() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { rewardsPrograms, items: rewards } = useSelector(
    (state: RootState) => state.reward
  );
  const [filterValue, setFilterValue] = useState("");
  const tenantId = "4896d272-e201-4dce-9048-f93b1e3ca49f";

  useEffect(() => {
    dispatch(
      fetchRewardPrograms({
        tenant_id: tenantId,
      })
    );
  }, [dispatch]);

  const handleAddReward = () => {
    router.push("/dashboard/admin/rewards/add");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);

    if (value.trim()) {
      dispatch(fetchRewardPrograms({ tenant_id: tenantId, name: value }));
    } else {
      dispatch(fetchRewardPrograms({ tenant_id: tenantId }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary" />
            Reward Programs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient reward programs and incentives
          </p>
        </div>
        <Button onClick={handleAddReward} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Reward Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reward Programs</CardTitle>
            <Input
              placeholder="Search by program name..."
              value={filterValue}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {rewardsPrograms.loading ? (
            <p>Loading...</p>
          ) : (
            <RewardProgramTable
              data={rewardsPrograms.data}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
