"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchHighCreditClients } from "@/lib/api";

type HighCreditClient = {
  email: string;
  first_name: string;
  last_name: string;
  credit_score: number;
};

export default function LoanOpportunitiesPage() {
  const [clients, setClients] = useState<HighCreditClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns: ColumnDef<HighCreditClient>[] = [
    {
      accessorKey: "first_name",
      header: "Name",
      cell: ({ row }) => {
        const firstName = row.original.first_name;
        const lastName = row.original.last_name;
        return (
          <div className="flex items-center gap-4">
            <img
              className="h-8 w-8"
              src={`https://api.dicebear.com/9.x/glass/svg?seed=${firstName} ${lastName}`}
              alt="client-image"
            />
            <p>{`${firstName} ${lastName}`}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "credit_score",
      header: "Credit Score",
      cell: ({ row }) => {
        const score = row.original.credit_score;
        return (
          <div className="flex items-center">
            <span className="font-medium text-green-600">{score}</span>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const loadHighCreditClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHighCreditClients();
        console.log("Received clients data:", data);
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          console.error("Received data is not an array:", data);
          setClients([]);
          setError("Failed to load client data");
        }
      } catch (error) {
        console.error("Error loading high credit clients:", error);
        setError("Failed to load client data");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    loadHighCreditClients();
  }, []);

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <PageTitle title="Loan Opportunities" />
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="mb-4 border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-800">ℹ️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Showing clients with credit scores of 700 or above who may be
              eligible for loan opportunities.
            </p>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="py-4 text-center">No high credit clients found.</div>
      ) : (
        <DataTable columns={columns} data={clients} table={table} />
      )}
    </div>
  );
}
