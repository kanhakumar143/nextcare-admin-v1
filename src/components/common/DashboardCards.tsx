"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

interface CreateItemProps {
  icon?: React.ReactNode;
  imageUrl?: string;
  header: string;
  subText: string;
  link?: string;
  onClick?: () => void;
}

const DashboardCards: React.FC<CreateItemProps> = ({
  icon,
  imageUrl,
  header,
  subText,
  link,
  onClick,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (link) router.push(link);
  };

  return (
    <Card className="hover:shadow-md cursor-pointer p-0" onClick={handleClick}>
      <div className="flex justify-between items-center bg-gray-200 w-full rounded-t-lg px-6 py-4">
        <div className=" flex items-center gap-3">
          <div className="bg-white p-3 m-1 rounded-full w-fit">{icon}</div>
          <p className="text-2xl font-semibold">{header}</p>
        </div>
        <div>
          <ArrowRight />
        </div>
      </div>
      <CardContent className="px-6 mb-6 flex flex-col justify-center">
        {!icon && imageUrl && (
          <Image
            src={imageUrl}
            alt="Icon"
            width={40}
            height={40}
            className="mb-2"
          />
        )}
        <p className="text-sm text-muted-foreground">{subText}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardCards;
