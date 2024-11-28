// TasteDive API base URL and your API key
const API_KEY = "1040852-MusicRec-79D92F12"; // Replace with your TasteDive API key
const API_URL = "https://tastedive.com/api/similar";

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const playlistUl = document.getElementById('playlist');

// Load playlist from localStorage on page load
window.onload = function () {
  const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
  savedPlaylist.forEach(item => addToPlaylist(item.name, item.wUrl, item.yUrl, false));
};

// Function to fetch recommendations from TasteDive API
async function fetchRecommendations(query) {
  try {
    const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&type=music&info=1&k=${API_KEY}`);
    const data = await response.json();
    return data.similar?.results || []; // Handle cases where Results might be undefined
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

// Function to display recommendations
function displayRecommendations(recommendations) {
  resultsDiv.innerHTML = ''; // Clear previous results
  recommendations.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `
      <a href="${item.wUrl || '#'}" style="text-decoration: none; color: inherit;" target="_blank">
        <strong>${item.name}</strong> (${item.type})
      </a>
      <p><a href="${item.yUrl || '#'}" target="_blank">Watch on YouTube</a></p>
      <button onclick="addToPlaylist('${item.name}', '${item.wUrl || '#'}', '${item.yUrl || '#'}', true)">Add to Playlist</button>
    `;
    resultsDiv.appendChild(div);
  });
}

// Function to add item to playlist
function addToPlaylist(name, wUrl, yUrl, saveToLocal = true) {
  const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];

  // Check if item is already in the playlist (localStorage and DOM)
  if (savedPlaylist.some(item => item.name === name)) {
    if (saveToLocal) alert("This item is already in your playlist!");
    return;
  }

  const li = document.createElement('li');
  li.innerHTML = `
    <a href="${wUrl}" target="_blank" style="text-decoration: none; color: inherit;">
      ${name}
    </a>
    <p><a href="${yUrl}" target="_blank">Watch on YouTube</a></p>
    <button class="remove-btn" onclick="removeFromPlaylist(this)">Remove</button>
  `;
  playlistUl.appendChild(li);

  // Save to localStorage if requested
  if (saveToLocal) {
    savedPlaylist.push({ name, wUrl, yUrl });
    localStorage.setItem('playlist', JSON.stringify(savedPlaylist));
  }
}

// Function to remove item from playlist
function removeFromPlaylist(button) {
  const li = button.parentElement;
  const name = li.querySelector("a").textContent;
  li.remove();

  // Update localStorage
  const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
  const updatedPlaylist = savedPlaylist.filter(item => item.name !== name);
  localStorage.setItem('playlist', JSON.stringify(updatedPlaylist));
}

// Event listener for search button
searchBtn.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  if (query) {
    const recommendations = await fetchRecommendations(query);
    if (recommendations?.length > 0) {
      displayRecommendations(recommendations);
    } else {
      resultsDiv.innerHTML = '<p>No recommendations found.</p>';
    }
  } else {
    alert("Please enter a search term.");
  }
});
