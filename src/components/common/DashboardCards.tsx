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
    <Card
      className="hover:shadow-md cursor-pointer p-0 flex flex-col gap-0"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center bg-primary w-full rounded-t-lg md:px-6 px-3 md:py-4 py-2">
        <div className=" flex items-center gap-3">
          <div className="bg-white md:p-3 p-2 md:m-1 rounded-full w-fit text-gray-600">
            {icon}
          </div>
          <p className="md:text-2xl text-lg font-bold text-white">{header}</p>
        </div>
        <div>
          <ArrowRight className="text-white" />
        </div>
      </div>
      <CardContent className="md:px-6 py-5 flex flex-col justify-center">
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
