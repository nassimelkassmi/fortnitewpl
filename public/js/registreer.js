

function registreer() {
    login()
}

// Define an async function to handle the POST request
async function login() {
    // Define the data to send in the request


    const loginData = {
        user: document.getElementById("username").value,
        pwd: document.getElementById("email").value,
        email: document.getElementById("password").value
    };
  
    // Make the POST request using fetch and await for the response
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json' // Set the content type to JSON
      },
      body: JSON.stringify(loginData) // Convert the data object to a JSON string
    });

  
    // Check if the response is undefined or not OK (200-299)
    if (!response || !response.ok) {
      console.error('There was a problem with the login request:', response ? `Status: ${response.status}` : 'No response received');
      return; // Exit the function if there's an issue
    }
  
    // Parse the JSON response and await the result
    const data = await response.json();
  
    // Check if the parsed data is undefined
    if (!data) {
      console.error('The response data is undefined.');
      return; // Exit the function if data is undefined
    }
  
    // Handle the response data
    console.log('Login successful:', data);
  }
  
  
  // Call the async function
  login();
