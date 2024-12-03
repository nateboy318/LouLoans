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
  estimated_salary?: number;
  balance?: number;
  country?: string;
};

interface LoanCalculation {
  maxAmount: number;
  interestRate: number;
  monthlyPayment: number;
  term: number;
}

function hasRequiredFields(client: any): client is HighCreditClient {
  return (
    client &&
    typeof client.credit_score === 'number' &&
    typeof client.first_name === 'string' &&
    typeof client.last_name === 'string' &&
    typeof client.email === 'string'
  );
}

function calculateLoanDetails(client: HighCreditClient): LoanCalculation {
  if (!hasRequiredFields(client)) {
    throw new Error('Invalid client data');
  }

  // Base calculation factors
  const baseAmount = 10000;
  const creditScoreMultiplier = (client.credit_score - 700) * 100;
  const incomeMultiplier = client.estimated_salary ? client.estimated_salary * 0.3 : 0;
  const balanceMultiplier = client.balance ? client.balance * 0.2 : 0;

  // Country risk adjustment (example factors)
  const countryRiskFactors: { [key: string]: number } = {
    usa: 1.0,
    uk: 1.0,
    canada: 1.0,
    germany: 0.9,
    france: 0.9,
    default: 0.8
  };

  const countryFactor = client.country ? 
    countryRiskFactors[client.country.toLowerCase()] || countryRiskFactors.default :
    countryRiskFactors.default;

  // Calculate maximum loan amount
  let maxAmount = (baseAmount + creditScoreMultiplier + incomeMultiplier + balanceMultiplier) * countryFactor;
  maxAmount = Math.min(maxAmount, 100000); // Cap at 100k

  // Calculate interest rate based on credit score
  const baseRate = 8.0;
  const creditScoreDiscount = ((client.credit_score - 700) * 0.01);
  const interestRate = Math.max(baseRate - creditScoreDiscount, 4.0); // Minimum 4% rate

  const term = 36; // 3 years
  const monthlyRate = interestRate / 12 / 100;
  const monthlyPayment = (maxAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                        (Math.pow(1 + monthlyRate, term) - 1);

  return {
    maxAmount: Math.round(maxAmount),
    interestRate: Number(interestRate.toFixed(2)),
    monthlyPayment: Math.round(monthlyPayment),
    term
  };
}

export default function LoanOpportunitiesPage() {
  const [clients, setClients] = useState<HighCreditClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<HighCreditClient | null>(null);
  const [loanDetails, setLoanDetails] = useState<LoanCalculation | null>(null);

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
        if (Array.isArray(data)) {
          const validClients = data.filter(hasRequiredFields);
          setClients(validClients);
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

  const handleRowClick = (client: HighCreditClient) => {
    if (!hasRequiredFields(client)) {
      console.error('Invalid client data:', client);
      return;
    }
    setSelectedClient(client);
    try {
      const details = calculateLoanDetails(client);
      setLoanDetails(details);
    } catch (error) {
      console.error('Error calculating loan details:', error);
    }
  };

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
              eligible for loan opportunities. Click on a row to see loan details.
            </p>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="py-4 text-center">No high credit clients found.</div>
      ) : (
        <div className="cursor-pointer">
          <DataTable 
            columns={columns} 
            data={clients} 
            table={table}
            onRowClick={handleRowClick}
          />
        </div>
      )}

      {/* Loan Details Modal */}
      {selectedClient && loanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Loan Eligibility for {selectedClient.first_name} {selectedClient.last_name}
              </h3>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-lg font-semibold text-green-700">
                  Maximum Loan Amount: ${loanDetails.maxAmount.toLocaleString()}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="text-lg font-medium">{loanDetails.interestRate}%</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Term Length</p>
                  <p className="text-lg font-medium">{loanDetails.term} months</p>
                </div>
              </div>
              
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-500">Estimated Monthly Payment</p>
                <p className="text-lg font-medium">
                  ${loanDetails.monthlyPayment.toLocaleString()}/month
                </p>
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full"
                  onClick={() => setSelectedClient(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}