"use client";

import { Card, CardContent } from "@/components/ui/card";
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

const CreateItem: React.FC<CreateItemProps> = ({
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
    <Card className="hover:shadow-md cursor-pointer" onClick={handleClick}>
      <CardContent className="p-6 flex flex-col justify-center items-center text-center">
        {icon && <div className="text-2xl">{icon}</div>}
        {!icon && imageUrl && (
          <Image
            src={imageUrl}
            alt="Icon"
            width={40}
            height={40}
            className="mb-2"
          />
        )}
        <h3 className="font-semibold mt-2">{header}</h3>
        <p className="text-sm text-muted-foreground">{subText}</p>
      </CardContent>
    </Card>
  );
};

export default CreateItem;
