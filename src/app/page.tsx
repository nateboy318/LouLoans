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

interface User {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  credit_score: number;
  country: string;
}

interface CountryScore {
  totalScore: number;
  count: number;
}

interface BalanceStats {
  [key: string]: CountryScore;
}

interface Stats {
  totalUsers: number;
  highestBalance: number;
  averageCreditScore: number;
  mostCommonCountry: string;
  mostCommonCountryFlag: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    highestBalance: 0,
    averageCreditScore: 0,
    mostCommonCountry: "N/A",
    mostCommonCountryFlag: "🗺️",
  });
  const [radarData, setRadarData] = useState<
    Array<{
      subject: string;
      score: number;
      max: number;
    }>
  >([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        const sortedUsers = [...data].sort(
          (a: User, b: User) => Number(b.customer_id) - Number(a.customer_id),
        );
        setUsers(sortedUsers);

        const balances = data.map((user: User) => user.balance || 0);
        const countries = data.map((user: User) => user.country || "Unknown");
        const creditScores = data.map((user: User) => user.credit_score || 0);

        const countryFrequency: Record<string, number> = countries.reduce(
          (acc: Record<string, number>, country: string) => {
            acc[country] = (acc[country] || 0) + 1;
            return acc;
          },
          {},
        );

        const mostCommonCountry = Object.entries(countryFrequency).sort(
          ([, a], [, b]) => b - a,
        )[0][0];

        const mostCommonCountryFlag =
          COUNTRY_TO_FLAG[mostCommonCountry.toLowerCase()] || "🗺️";

        setStats({
          totalUsers: data.length,
          highestBalance: Math.max(...balances),
          averageCreditScore: Math.round(
            creditScores.reduce((a: number, b: number) => a + b, 0) /
              data.length,
          ),
          mostCommonCountry,
          mostCommonCountryFlag,
        });

        const countryScores = data.reduce((acc: BalanceStats, user: User) => {
          if (user.country && user.credit_score) {
            if (!acc[user.country]) {
              acc[user.country] = { totalScore: 0, count: 0 };
            }
            acc[user.country].totalScore += user.credit_score;
            acc[user.country].count += 1;
          }
          return acc;
        }, {} as BalanceStats);

        const averageScoresByCountry = Object.entries(
          countryScores as BalanceStats,
        ).map(([country, scores]) => ({
          country: `${country} ${COUNTRY_TO_FLAG[country.toLowerCase()] || "🗺️"}`,
          averageCreditScore: scores.totalScore / scores.count,
        }));

        const radarFormattedData = averageScoresByCountry.map(
          ({ country, averageCreditScore }) => ({
            subject: country,
            score: averageCreditScore,
            max: 800,
          }),
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
      amount: stats.averageCreditScore.toString(),
      description: "Average user credit score",
      icon: BadgePercent,
    },
    {
      label: "Most Common Country",
      amount: `${stats.mostCommonCountry} ${stats.mostCommonCountryFlag}`,
      description: "Popular location",
      icon: Flag,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-5">
      <PageTitle title="Dashboard" />

      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((data, index) => (
          <Card
            key={index}
            amount={data.amount}
            discription={data.description}
            icon={data.icon}
            label={data.label}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 transition-all lg:grid-cols-2">
        <CardContent>
          <div>
            <p className="mb-4 font-semibold">
              Average Credit Score by Country
            </p>
            <div className="flex h-[350px] items-center justify-center">
              {loading ? (
                "Loading credit score data..."
              ) : radarData.length > 0 ? (
                <RadarChart width={700} height={400} data={radarData}>
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
            <p className="mb-4 font-semibold">Recent Created Users</p>
            <div className="flex max-h-[350px] flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
              {loading ? (
                <div className="py-4 text-center">Loading users...</div>
              ) : (
                users.slice(0, 10).map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b p-4 transition-colors hover:bg-gray-50"
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
                      <p className="text-right text-xs text-gray-400">
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
