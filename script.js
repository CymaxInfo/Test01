let watchId = null; 
let targetLocations = [
  { latitude: 17.4332, longitude: 78.4492, audioId: 'audio1' }, 
  { latitude: 17.4306, longitude: 78.4556, audioId: 'audio2' }, 
  { latitude: 17.4307, longitude: 78.4556, audioId: 'audio3' }, 
  { latitude: 17.4306, longitude: 78.4557, audioId: 'audio4' }, 
  { latitude: 17.4305, longitude: 78.4557, audioId: 'audio5' }  
];
let proximityThreshold = 0.01; 
let audioPlayed = false; 

function startTracking() {
  if ("geolocation" in navigator) {
    watchId = navigator.geolocation.watchPosition(
      function(position) {
        // Update latitude and longitude elements
        document.getElementById("latitude").textContent = position.coords.latitude.toFixed(5);
        document.getElementById("longitude").textContent = position.coords.longitude.toFixed(5);

        // Check proximity to each target location
        let nearestDistance = Number.MAX_VALUE;
        let nearestIndex = -1;
        targetLocations.forEach(function(target, index) {
          let distance = calculateDistance(position.coords.latitude, position.coords.longitude, target.latitude, target.longitude);
          console.log(`Distance to target ${index + 1}:`, distance.toFixed(2), "km");
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        // Update progress bar and step indicator based on proximity to the nearest target
        let progress = 100 - ((nearestDistance / proximityThreshold) * 100);
        progress = Math.max(0, Math.min(100, progress)); // Ensure progress is between 0 and 100
        document.getElementById("progressBar").value = progress;
        
        // Update step indicator
        updateStepIndicator(nearestIndex + 1);

        // Check proximity to original target location and play audio
        if (!audioPlayed && isNearTarget(position.coords.latitude, position.coords.longitude)) {
          let audioId = targetLocations[nearestIndex].audioId;
          playAudio(audioId);
          audioPlayed = true; // Set flag to true after playing audio
        } else if (!isNearTarget(position.coords.latitude, position.coords.longitude)) {
          audioPlayed = false; // Reset flag if user moves away from target
          stopAllAudio(); // Stop all audio if user moves away
        }
      },
      function(error) {
        console.error("Error getting geolocation:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    console.log("Location tracking stopped.");
    // Clear latitude and longitude elements
    document.getElementById("latitude").textContent = "";
    document.getElementById("longitude").textContent = "";
    audioPlayed = false; // Reset audio played flag
    stopAllAudio(); // Stop all audio playback
    watchId = null; // Reset watchId
    document.getElementById("progressBar").value = 0; // Reset progress bar
    // Reset step indicators
    resetStepIndicators();
  } else {
    console.log("No active watch to clear.");
  }
}

// Function to check proximity to target location
function isNearTarget(latitude, longitude) {
  let distance = calculateDistance(latitude, longitude, targetLocations[0].latitude, targetLocations[0].longitude);
  console.log("Distance to original target:", distance);
  return distance <= proximityThreshold;
}

// Function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Function to play audio by ID
function playAudio(audioId) {
  stopAllAudio(); // Stop all other audio before playing
  let audio = document.getElementById(audioId);
  audio.play();
}

// Function to stop all audio playback
function stopAllAudio() {
  let audioElements = document.getElementsByTagName('audio');
  for (let audio of audioElements) {
    audio.pause();
    audio.currentTime = 0; // Reset audio playback position
  }
}

// Function to update step indicator
function updateStepIndicator(step) {
  resetStepIndicators();
  for (let i = 1; i <= step; i++) {
    document.getElementById(`step${i}`).classList.add('active');
  }
}

// Function to reset step indicators
function resetStepIndicators() {
  let steps = document.querySelectorAll('.step');
  steps.forEach(step => {
    step.classList.remove('active');
  });
}

// Event listeners for buttons
document.getElementById("startTrackingBtn").addEventListener("click", function() {
  startTracking();
});

document.getElementById("stopTrackingBtn").addEventListener("click", function() {
  stopTracking();
});
