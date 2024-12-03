const API_BASE = "/api";

export interface APIUser {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  balance: number;
  credit_score: number;
  country: string;
}

interface Analytics {
  totalUsers: number;
  highestBalance: number;
  lowestBalance: number;
  popularCountry: string;
  recentUsers: APIUser[];
  creditScores: Array<{ score: number; name: string }>;
}

interface CountMap {
  [key: string]: number;
}

interface UpdateUserData extends APIUser {}

interface CreateUserData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  balance?: number;
  credit_card?: number;
  estimated_salary?: number;
  credit_score?: number;
  country?: string;
  gender?: string;
  age?: number;
}

export async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE}/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const rawData = await response.text(); // Get raw response first
    console.log("Raw API Response:", rawData);

    if (!rawData) {
      console.log("Empty response from API");
      return [];
    }

    const data = JSON.parse(rawData);
    console.log("Parsed API Response:", data);

    if (data.body) {
      const parsedBody = JSON.parse(data.body);
      console.log("Parsed Body:", parsedBody);
      return parsedBody;
    }

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function deleteUser(customerId: string) {
  try {
    // Log the customer ID before sending the request
    console.log("Attempting to delete user with customer_id:", customerId);

    const response = await fetch(`${API_BASE}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customer_id: customerId }), // The payload being sent
    });

    // Check the response and log it
    const result = await response.json();
    console.log("Delete response:", result); // Log the API response

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete user");
    }

    return result;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function updateUser(userData: any) {
  try {
    const response = await fetch(`${API_BASE}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function fetchUserAnalytics() {
  try {
    const response = await fetch(`/api/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const rawData = await response.text();
    console.log("Raw API Response:", rawData);

    if (!rawData) {
      return {
        totalUsers: 0,
        highestBalance: 0,
        lowestBalance: 0,
        popularCountry: "N/A",
        recentUsers: [],
        creditScores: [],
      };
    }

    const data = JSON.parse(rawData);
    console.log("Parsed API Response:", data);

    let users = [];
    if (data.body) {
      try {
        users =
          typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      } catch (e) {
        console.error("Error parsing body:", e);
        users = [];
      }
    }

    console.log("Processed Users:", users);

    // Process analytics
    const analytics = {
      totalUsers: users.length,
      highestBalance: users.length
        ? Math.max(...users.map((u: any) => parseFloat(u.balance || 0)))
        : 0,
      lowestBalance: users.length
        ? Math.min(...users.map((u: any) => parseFloat(u.balance || 0)))
        : 0,
      popularCountry: users.length
        ? getMostFrequent(users.map((u: any) => u.country || "Unknown"))
        : "N/A",
      recentUsers: users.slice(0, 10),
      creditScores: users.map((u: any) => ({
        score: parseInt(u.credit_score || 0),
        name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
      })),
    };

    return analytics;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    // Return default values on error
    return {
      totalUsers: 0,
      highestBalance: 0,
      lowestBalance: 0,
      popularCountry: "N/A",
      recentUsers: [],
      creditScores: [],
    };
  }
}

function getMostFrequent(arr: string[]): string {
  if (!arr.length) return "N/A";

  const counts = arr.reduce<CountMap>((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}
// Add this to your existing api.ts

export async function createUser(userData: CreateUserData): Promise<any> {
  try {
    console.log("API Request Data:", userData);
    const response = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.text();
    if (!response.ok) {
      throw new Error(
        `Failed to create user: ${response.status} ${response.statusText} - ${data}`,
      );
    }

    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function fetchHighCreditClients() {
  try {
    const response = await fetch(`${API_BASE}/loan_offer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("API Response Data:", data);
    return data["clients received for loan offers"];
  } catch (error) {
    console.error("Error fetching high credit clients:", error);
    return [];
  }
}

export async function handleDeposit(customerId: string, amount: number) {
  try {
    const response = await fetch(`${API_BASE}/deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        amount: amount,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error making deposit:", error);
    throw error;
  }
}

export async function handleWithdraw(customerId: string, amount: number) {
  try {
    const response = await fetch(`${API_BASE}/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        amount: amount,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error making withdrawal:", error);
    throw error;
  }
}
