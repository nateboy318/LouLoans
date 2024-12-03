const API_BASE = '/api';

export async function fetchUsers() {
    try {
      const response = await fetch(`${API_BASE}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const rawData = await response.text(); // Get raw response first
      console.log('Raw API Response:', rawData);
      
      if (!rawData) {
        console.log('Empty response from API');
        return [];
      }
      
      const data = JSON.parse(rawData);
      console.log('Parsed API Response:', data);
      
      if (data.body) {
        const parsedBody = JSON.parse(data.body);
        console.log('Parsed Body:', parsedBody);
        return parsedBody;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  export async function deleteUser(customerId: string) {
    try {
      // Log the customer ID before sending the request
      console.log('Attempting to delete user with customer_id:', customerId);
      
      const response = await fetch(`${API_BASE}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customerId }),  // The payload being sent
      });
  
      // Check the response and log it
      const result = await response.json();
      console.log('Delete response:', result);  // Log the API response
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete user');
      }
  
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  
  

export async function updateUser(userData: any) {
  try {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function fetchUserAnalytics() {
    try {
      const response = await fetch(`/api/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const rawData = await response.text();
      console.log('Raw API Response:', rawData);
      
      if (!rawData) {
        return {
          totalUsers: 0,
          highestBalance: 0,
          lowestBalance: 0,
          popularCountry: 'N/A',
          recentUsers: [],
          creditScores: []
        };
      }
  
      const data = JSON.parse(rawData);
      console.log('Parsed API Response:', data);
  
      let users = [];
      if (data.body) {
        try {
          users = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        } catch (e) {
          console.error('Error parsing body:', e);
          users = [];
        }
      }
  
      console.log('Processed Users:', users);
  
      // Process analytics
      const analytics = {
        totalUsers: users.length,
        highestBalance: users.length ? Math.max(...users.map((u: any) => parseFloat(u.balance || 0))) : 0,
        lowestBalance: users.length ? Math.min(...users.map((u: any) => parseFloat(u.balance || 0))) : 0,
        popularCountry: users.length ? getMostFrequent(users.map((u: any) => u.country || 'Unknown')) : 'N/A',
        recentUsers: users.slice(0, 10),
        creditScores: users.map((u: any) => ({
          score: parseInt(u.credit_score || 0),
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim()
        }))
      };
  
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return default values on error
      return {
        totalUsers: 0,
        highestBalance: 0,
        lowestBalance: 0,
        popularCountry: 'N/A',
        recentUsers: [],
        creditScores: []
      };
    }
  }
  
  function getMostFrequent(arr: any[]) {
    if (!arr.length) return 'N/A';
    
    const counts = arr.reduce((acc: any, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
  
    return Object.entries(counts).reduce((a, b) => 
      counts[a] > counts[b[0]] ? a : b[0]
    );
  }