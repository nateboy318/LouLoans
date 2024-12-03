"use client";
import PageTitle from "@/components/PageTitle";
import Card from "@/components/card";
import { Users, DollarSign, Flag, BadgePercent } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUsers } from "@/lib/api";
import { CardContent } from "@/components/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";

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

type User = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  credit_score: number;
  country: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    highestBalance: 0,
    averageCreditScore: 0,
    mostCommonCountry: "N/A",
    mostCommonCountryFlag: "🗺️", // Add flag state
  });
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        setUsers(data);

        // Calculate stats from the data
        const balances = data.map((user) => user.balance || 0);
        const countries = data.map((user) => user.country || "Unknown");
        const creditScores = data.map((user) => user.credit_score || 0);

        // Find most common country
        const countryFrequency = countries.reduce((acc, country) => {
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const mostCommonCountry = Object.entries(countryFrequency).sort(
          ([, a], [, b]) => b - a
        )[0][0];

        // Get the flag for the most common country
        const mostCommonCountryFlag =
          COUNTRY_TO_FLAG[mostCommonCountry.toLowerCase()] || "🗺️";

        setStats({
          totalUsers: data.length,
          highestBalance: Math.max(...balances),
          averageCreditScore: Math.round(
            creditScores.reduce((a, b) => a + b, 0) / data.length
          ),
          mostCommonCountry,
          mostCommonCountryFlag, // Set the flag
        });

        // Prepare radar data
        const countryScores = data.reduce((acc, user) => {
          if (user.country && user.credit_score) {
            if (!acc[user.country]) {
              acc[user.country] = { totalScore: 0, count: 0 };
            }
            acc[user.country].totalScore += user.credit_score;
            acc[user.country].count += 1;
          }
          return acc;
        }, {});

        const averageScoresByCountry = Object.entries(countryScores).map(
          ([country, { totalScore, count }]) => ({
            country: `${country} ${
              COUNTRY_TO_FLAG[country.toLowerCase()] || "🗺️"
            }`,
            averageCreditScore: totalScore / count,
          })
        );

        // Format radar data
        const radarFormattedData = averageScoresByCountry.map(
          ({ country, averageCreditScore }) => ({
            subject: country,
            score: averageCreditScore,
            max: 800, // Set max credit score (you can adjust as needed)
          })
        );

        setRadarData(radarFormattedData);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const cardData = [
    {
      label: "Total Users",
      amount: stats.totalUsers.toString(),
      description: "Total registered users",
      icon: Users,
    },
    {
      label: "Highest Account Balance",
      amount: `$${stats.highestBalance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      description: "Top account balance",
      icon: DollarSign,
    },
    {
      label: "Average Credit Score",
      amount: stats.averageCreditScore.toString(), // Show rounded average
      description: "Average user credit score",
      icon: BadgePercent,
    },
    {
      label: "Most Common Country",
      amount: `${stats.mostCommonCountry} ${stats.mostCommonCountryFlag}`, // Add flag here
      description: "Popular location",
      icon: Flag,
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Dashboard" />

      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((data, index) => (
          <Card
            key={index}
            amount={data.amount}
            description={data.description}
            icon={data.icon}
            label={data.label}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 transition-all lg:grid-cols-2">
        <CardContent>
          <div>
            <p className="font-semibold mb-4">
              Average Credit Score by Country
            </p>
            <div className="h-[350px] flex items-center justify-center">
              {loading ? (
                "Loading credit score data..."
              ) : radarData.length > 0 ? (
                <RadarChart width={700} height={500} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Radar
                    dataKey="score"
                    stroke="#000"
                    fill="#000"
                    fillOpacity={0.2}
                  />
                  <Tooltip formatter={(value: number) => value.toFixed(0)} />
                </RadarChart>
              ) : (
                "No country data available"
              )}
            </div>
          </div>
        </CardContent>

        <CardContent>
          <section>
            <p className="font-semibold mb-4">Recent Created Users</p>
            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {loading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : (
                users.slice(0, 10).map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        className="h-8 w-8"
                        src={`https://api.dicebear.com/9.x/glass/svg?seed=${user.first_name}${user.last_name}`}
                        alt="user-image"
                      />
                      <div>
                        <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">{user.phone}</p>
                      <p className="text-right text-gray-400 text-xs">
                        Credit Score: {user.credit_score || "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </CardContent>
      </section>
    </div>
  );
}
