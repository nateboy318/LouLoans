"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchUsers, deleteUser, updateUser, type APIUser } from "@/lib/api";
import Modal from "@/components/Modal";
import { Loader2 } from "lucide-react";

type Props = {};
type User = {
  id: string;
  name: string;
  email: string;
  balance: string;
  creditScore: number;
  country: string;
};

const COUNTRY_TO_FLAG: { [key: string]: string } = {
  uk: "🇬🇧",
  england: "🇬🇧",
  france: "🇫🇷",
  spain: "🇪🇸",
  germany: "🇩🇪",
  italy: "🇮🇹",
  netherlands: "🇳🇱",
  portugal: "🇵🇹",
  ireland: "🇮🇪",
  belgium: "🇧🇪",
  sweden: "🇸🇪",
  norway: "🇳🇴",
  denmark: "🇩🇰",
  finland: "🇫🇮",
  russia: "🇷🇺",
  poland: "🇵🇱",
  austria: "🇦🇹",
  switzerland: "🇨🇭",
  greece: "🇬🇷",
  turkey: "🇹🇷",
  usa: "🇺🇸",
  canada: "🇨🇦",
  australia: "🇦🇺",
  japan: "🇯🇵",
  china: "🇨🇳",
  india: "🇮🇳",
  brazil: "🇧🇷",
  mexico: "🇲🇽",
};

export default function UsersPage({}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const transformApiData = (apiUsers: APIUser[]): User[] => {
    const sortedUsers = [...apiUsers].reverse();
    return sortedUsers.map((user) => {
      const country = user.country?.toLowerCase() || "";
      const displayCountry = country.charAt(0).toUpperCase() + country.slice(1);
      return {
        id: user.customer_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        balance: user.balance ? `$${user.balance.toLocaleString()}` : "$0",
        creditScore: user.credit_score || 0,
        country: `${displayCountry} ${COUNTRY_TO_FLAG[country] || "🗺️"}`,
      };
    });
  };

const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(searchTerm.toLowerCase())
);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-4">
            <img
              className="h-8 w-8"
              src={`https://api.dicebear.com/9.x/glass/svg?seed=${row.getValue("name")}`}
              alt="user-image"
            />
            <p>{row.getValue("name")}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "balance",
      header: "Balance",
    },
    {
      accessorKey: "creditScore",
      header: "Credit Score",
      cell: ({ row }) => {
        const score = row.getValue("creditScore") as number;
        let weightClass = "font-normal";
        if (score >= 700) weightClass = "font-normal";
        else if (score <= 600) weightClass = "font-normal";
        return <div className={`text-black ${weightClass}`}>{score}</div>;
      },
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        const value = row.getValue("country") as string;
        const [country, flag] = value.split(" ");
        return (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{flag}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const handleEdit = (user: User) => {
          setSelectedUser(user);
          setIsModalOpen(true);
        };

        const handleDelete = async (id: string) => {
          const customerId = row.original.id;
          if (window.confirm("Are you sure you want to delete this user?")) {
            try {
              await deleteUser(customerId);
              setUsers(users.filter((user) => user.id !== customerId));
            } catch (error) {
              console.error("Failed to delete user:", error);
            }
          }
        };

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4 text-black" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-black" />
            </Button>
          </div>
        );
      },
    },
  ];

const table = useReactTable({
  data: users,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    globalFilter: searchTerm,
  },
  onGlobalFilterChange: setSearchTerm,
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
});

  const handleSaveUser = async (updatedUser: any) => {
    try {
      await updateUser(updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === updatedUser.customer_id) {
            return {
              ...user,
              name: `${updatedUser.first_name} ${updatedUser.last_name}`,
              email: updatedUser.email,
              balance: `$${updatedUser.balance.toLocaleString()}`,
              creditScore: updatedUser.credit_score,
              country: `${
                updatedUser.country.charAt(0).toUpperCase() +
                updatedUser.country.slice(1)
              } ${
                COUNTRY_TO_FLAG[updatedUser.country.toLowerCase()] || "🗺️"
              }`,
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        const transformedUsers = transformApiData(data);
        setUsers(transformedUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <PageTitle title="Users" />
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-md border border-gray-200 pl-8 pr-4 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
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
      </div>
      <DataTable columns={columns} data={users} table={table} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={
          selectedUser || {
            id: "",
            name: "",
            email: "",
            balance: "",
            creditScore: 0,
            country: "",
          }
        }
        onSave={handleSaveUser}
      />
    </div>
  );
}