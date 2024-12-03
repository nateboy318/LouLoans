"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchUsers, deleteUser, updateUser, type APIUser } from "@/lib/api";
import Modal from "@/components/Modal"; // Import the Modal component

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
  const [isModalOpen, setIsModalOpen] = useState(false); // To control the modal visibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // To store selected user for editing

  // Function to transform API data to table format
  const transformApiData = (apiUsers: APIUser[]): User[] => {
    return apiUsers.map(user => {
      const country = user.country?.toLowerCase() || '';
      const displayCountry = country.charAt(0).toUpperCase() + country.slice(1);
      
      return {
        id: user.customer_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        balance: user.balance ? `$${user.balance.toLocaleString()}` : '$0',
        creditScore: user.credit_score || 0,
        country: `${displayCountry} ${COUNTRY_TO_FLAG[country] || '🗺️'}`,
      };
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 items-center">
            <img
              className="h-8 w-8"
              src={`https://api.dicebear.com/9.x/glass/svg?seed=${row.getValue("name")}`}
              alt="user-image"
            />
            <p>{row.getValue("name")} </p>
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
        const [country, flag] = value.split(' ');
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
          setSelectedUser(user); // Set selected user data
          setIsModalOpen(true); // Open the modal
        };

        const handleDelete = async () => {
          const customerId = row.original.id;
        
          if (window.confirm('Are you sure you want to delete this user?')) {
            try {
              await deleteUser(customerId);
              setUsers(users.filter(user => user.id !== customerId));  // Remove user from state after deletion
            } catch (error) {
              console.error('Failed to delete user:', error);
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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleSaveUser = async (updatedUser: User) => {
    try {
      // Call updateUser API here to update user data
      await updateUser(updatedUser);
      // Update local state with the modified user
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        const transformedUsers = transformApiData(data);
        setUsers(transformedUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <PageTitle title="Users" />
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
      <DataTable columns={columns} data={users} table={table} />
      
      {/* Modal component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={selectedUser || {}}
        onSave={handleSaveUser}
      />
    </div>
  );
}
