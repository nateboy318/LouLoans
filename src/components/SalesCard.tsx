import React from "react";

export type SalesProps = {
  name: string;
  email: string;
  salesAmount: string;
};

export default function SalesCard(props: SalesProps) {
  return (
    <div className="flex flex-wrap justify-between gap-3">
      <section className="flex justify-between gap-3">
        <div className="h-12 w-12 rounded-full bg-gray-100 p-1">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${props.name}`}
            alt="avatar"
            width={200}
            height={200}
          />
        </div>
        <div className="text-sm">
          <p>{props.name}</p>
          <div className="w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-400 sm:w-auto">
            {props.email}
          </div>
        </div>
      </section>
      <p>{props.salesAmount}</p>
    </div>
  );
}
