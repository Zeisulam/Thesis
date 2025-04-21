document.addEventListener("DOMContentLoaded", function () {
  const socket = io("https://ptu-08k7.onrender.com");
  let currentPerforming = "";
  let waitingForRFID = null;
  let isScoringActive = false;
  let playerStarted = { 1: false, 2: false };
  let playerSubmitted = { 1: false, 2: false };
  const registeredRFIDs = {};
  let gameNumber = 1; // Global game counter

  socket.on("rfid_data", function (data) {
    if (isScoringActive || !waitingForRFID) return;

    const rfid = data.rfid;
    console.log("RFID Scanned:", rfid);

    fetch(`/get_player/${rfid}`)
      .then((response) => response.json())
      .then((player) => {
        if (!player) {
          updatePlayerStatus(waitingForRFID, "Not Registered");
          resetRegisterButton(waitingForRFID);
          return;
        }

        for (const key in registeredRFIDs) {
          if (registeredRFIDs[key] === rfid) {
            alert(`This RFID is already registered to Player ${key}!`);
            resetRegisterButton(waitingForRFID);
            return;
          }
        }

        if (registeredRFIDs[waitingForRFID]) {
          unregisterPlayer(waitingForRFID);
        }

        assignPlayer(waitingForRFID, rfid, player);
        resetRegisterButton(waitingForRFID);

        // 🔴 Broadcast the update to the audience
        socket.emit("update_audience", { registeredRFIDs });
      })
      .catch((error) => console.error("Error fetching player:", error));
  });

  function assignPlayer(playerNumber, rfid, player) {
    updatePlayerInfo(playerNumber, player);
    registeredRFIDs[playerNumber] = rfid;
    waitingForRFID = null;
    if (registeredRFIDs[1] && registeredRFIDs[2]) {
      waitingForRFID = null;
      console.log("Both players registered. Moving to next step...");

      // 🔴 Emit an event so the audience screen updates too
      socket.emit("game_state", { state: "waiting-start" });
    }
  }

  function unregisterPlayer(playerNumber) {
    delete registeredRFIDs[playerNumber];

    document.getElementById(`player${playerNumber}-name`).innerText =
      "Not Registered";
    document.getElementById(`player${playerNumber}-category`).innerText = "";
    document.getElementById(`player${playerNumber}-belt`).innerText = "";
    document.getElementById(`player${playerNumber}-gym`).innerText = "";
    document.querySelector(`.player${playerNumber}-detected`).innerText =
      "Waiting for registration...";
  }

  function updatePlayerInfo(playerNumber, player) {
    const fullName = `${player.firstname || ""} ${player.middlename || ""} ${
      player.lastname || ""
    }`.trim();

    document.getElementById(`player${playerNumber}-name`).innerText =
      fullName || "Unknown";
    document.getElementById(`player${playerNumber}-category`).innerText =
      player.category || "Unknown";
    document.getElementById(`player${playerNumber}-belt`).innerText =
      player.belt || "Unknown";
    document.getElementById(`player${playerNumber}-gym`).innerText =
      player.gym || "Unknown";
    document.querySelector(`.player${playerNumber}-detected`).innerText =
      "Registered";
  }

  function updatePlayerStatus(playerNumber, status) {
    document.querySelector(`.player${playerNumber}-detected`).innerText =
      status;
  }

  function resetRegisterButton(playerNumber) {
    const registerButton = document.querySelector(
      `.player${playerNumber}-register`
    );
    if (registerButton)
      registerButton.innerText = `Register Player ${playerNumber}`;
  }

  document
    .querySelector(".player1-register")
    .addEventListener("click", function () {
      if (isScoringActive || waitingForRFID) return;
      document.querySelector(`.player1-detected`).innerText = "Detecting...";
      waitingForRFID = 1;
    });

  document
    .querySelector(".player2-register")
    .addEventListener("click", function () {
      if (isScoringActive || waitingForRFID) return;
      document.querySelector(`.player2-detected`).innerText = "Detecting...";
      waitingForRFID = 2;
    });

  function generateRandomScores(playerNumber) {
    if (!registeredRFIDs[1] || !registeredRFIDs[2]) {
      alert("Both players must be registered before starting!");
      return;
    }

    if (playerStarted[playerNumber]) return;

    playerStarted[playerNumber] = true;
    isScoringActive = true;
    if (!playerStarted[1] && !playerSubmitted[1]) {
      alert("Player 1 must start before Player 2!");
      return;
    }

    const accuracyScore = (Math.random() * 4).toFixed(1);
    const presentationScore = (Math.random() * 6).toFixed(1);

    document.getElementById(`player${playerNumber}-accuracy-score`).innerText =
      accuracyScore;
    document.getElementById(
      `player${playerNumber}-presentation-score`
    ).innerText = presentationScore;

    const totalScore =
      parseFloat(accuracyScore) + parseFloat(presentationScore);
    document.getElementById(`player${playerNumber}-total-score`).innerText =
      totalScore.toFixed(1);

    // If currentPerforming is not set, generate it (based on both players’ belt)
    if (!currentPerforming) {
      // Get belt values (assumed to be already set by registration)
      const belt1 = document
        .getElementById("player1-belt")
        .innerText.toLowerCase();
      const belt2 = document
        .getElementById("player2-belt")
        .innerText.toLowerCase();

      let performingOptions = [];
      // If both players have black belt, use black performing options; otherwise, use Taeguk options.
      if (belt1 === "black" && belt2 === "black") {
        performingOptions = ["Koryo", "Keumgang", "Taebek"];
      } else {
        performingOptions = [
          "Taeguk 1",
          "Taeguk 2",
          "Taeguk 3",
          "Taeguk 4",
          "Taeguk 5",
          "Taeguk 6",
          "Taeguk 7",
          "Taeguk 8",
        ];
      }
      const randomIndex = Math.floor(Math.random() * performingOptions.length);
      currentPerforming = performingOptions[randomIndex];
    }

    // Assign the same performing value to both players
    document.getElementById("player1-performing").innerText = currentPerforming;
    document.getElementById("player2-performing").innerText = currentPerforming;
  }

  function displayWinner() {
    // Get necessary DOM elements for totals and submission status
    const player1TotalEl = document.getElementById("player1-total-score");
    const player2TotalEl = document.getElementById("player2-total-score");
    const player1SubmitEl = document.getElementById("player1-submit");
    const player2SubmitEl = document.getElementById("player2-submit");

    // Check if elements exist
    if (
      !player1TotalEl ||
      !player2TotalEl ||
      !player1SubmitEl ||
      !player2SubmitEl
    ) {
      console.error("Error: One or more elements are missing!");
      alert("Error: Required elements are missing in the DOM.");
      return;
    }

    // Parse totals
    const player1Total = parseFloat(player1TotalEl.innerText) || 0;
    const player2Total = parseFloat(player2TotalEl.innerText) || 0;

    // Check submission status
    const player1Submitted = player1SubmitEl.value === "true";
    const player2Submitted = player2SubmitEl.value === "true";

    if (!player1Submitted || !player2Submitted) {
      alert("Error: Both players must submit their scores first!");
      return;
    }

    // Determine winner
    let winnerText = "";
    let winnerNumber = null;
    let winnerData = null;

    if (player1Total > player2Total) {
      winnerText = "🏆 Player 1 Wins!";
      winnerNumber = 1;
      winnerData = {
        name: document.getElementById("player1-name").innerText,
        category: document.getElementById("player1-category").innerText,
        belt: document.getElementById("player1-belt").innerText,
        gym: document.getElementById("player1-gym").innerText,
        totalScore: player1Total,
      };

      console.log("[DEBUG] Emitting PLAYER1_WIN:", winnerData);
      socket.emit("winner_displayed", { winner: "PLAYER1_WIN", winnerData });
    } else if (player2Total > player1Total) {
      winnerText = "🏆 Player 2 Wins!";
      winnerNumber = 2;
      winnerData = {
        name: document.getElementById("player2-name").innerText,
        category: document.getElementById("player2-category").innerText,
        belt: document.getElementById("player2-belt").innerText,
        gym: document.getElementById("player2-gym").innerText,
        totalScore: player2Total,
      };

      console.log("[DEBUG] Emitting PLAYER2_WIN:", winnerData);
      socket.emit("winner_displayed", { winner: "PLAYER2_WIN", winnerData });
    } else {
      winnerText = "🤝 It's a Tie!";
      console.log("[DEBUG] Emitting DRAW");
      socket.emit("winner_displayed", { winner: "DRAW" });
    }

    // Gather player details
    const player1Info = {
      name: document.getElementById("player1-name").innerText,
      belt: document.getElementById("player1-belt").innerText,
      gym: document.getElementById("player1-gym").innerText,
      category: document.getElementById("player1-category").innerText,
      accuracy: document.getElementById("player1-accuracy-score").innerText,
      presentation: document.getElementById("player1-presentation-score")
        .innerText,
      totalScore: document.getElementById("player1-total-score").innerText,
      performing: document.getElementById("player1-performing").innerText,
      status: "", // to be assigned below
      game: gameNumber,
    };

    const player2Info = {
      name: document.getElementById("player2-name").innerText,
      belt: document.getElementById("player2-belt").innerText,
      gym: document.getElementById("player2-gym").innerText,
      category: document.getElementById("player2-category").innerText,
      accuracy: document.getElementById("player2-accuracy-score").innerText,
      presentation: document.getElementById("player2-presentation-score")
        .innerText,
      totalScore: document.getElementById("player2-total-score").innerText,
      performing: document.getElementById("player2-performing").innerText,
      status: "",
      game: gameNumber,
    };

    // Set status based on the winner
    if (winnerText === "🤝 It's a Tie!") {
      player1Info.status = "Tie";
      player2Info.status = "Tie";
    } else {
      player1Info.status = winnerNumber === 1 ? "Winner" : "Loser";
      player2Info.status = winnerNumber === 2 ? "Winner" : "Loser";
    }

    // Post the game info to the server
    const gameData = {
      game: gameNumber,
      players: [
        player1Info,
        {
          name: document.getElementById("player1-name").innerText,
          totalScore: player1Total,
          status: winnerText.includes("Player 1") ? "Winner" : "Loser",
        },
        player2Info,
        {
          name: document.getElementById("player2-name").innerText,
          totalScore: player2Total,
          status: winnerText.includes("Player 2") ? "Winner" : "Loser",
        },
      ],
    };

    // **Save both players' info in MongoDB**
    fetch("/api/winners/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gameData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Game data saved successfully:", data);
      })
      .catch((error) => {
        console.error("Error saving game data:", error);
      });

    // Alert the winner
    alert(winnerText);

    // Increment game number for the next match
    gameNumber++;

    // Reset the game
    resetGame();
  }

  // Reset function to clear data
  function resetGame() {
    console.log("Resetting game...");

    // Reset global variables
    waitingForRFID = null;
    isScoringActive = false;
    playerStarted = { 1: false, 2: false };
    playerSubmitted = { 1: false, 2: false };
    // Clear registeredRFIDs keys
    for (let key in registeredRFIDs) {
      delete registeredRFIDs[key];
    }
    currentPerforming = ""; // Reset performing value
    // Reset scores to initial values
    document.getElementById("player1-total-score").innerText = "10";
    document.getElementById("player2-total-score").innerText = "10";
    document.getElementById("player1-accuracy-score").innerText = "4";
    document.getElementById("player1-presentation-score").innerText = "6";
    document.getElementById("player2-accuracy-score").innerText = "4";
    document.getElementById("player2-presentation-score").innerText = "6";

    // Clear deductions
    document.getElementById("player1-accuracy-deduction").value = "";
    document.getElementById("player1-presentation-deduction").value = "";
    document.getElementById("player1-performing").innerText = "";
    document.getElementById("player2-performing").innerText = "";
    document.getElementById("player2-accuracy-deduction").value = "";
    document.getElementById("player2-presentation-deduction").value = "";

    // Reset player details for Player 1
    document.getElementById("player1-name").innerText = "";
    document.getElementById("player1-category").innerText = "";
    document.getElementById("player1-belt").innerText = "";
    document.getElementById("player1-gym").innerText = "";
    document.querySelector(".player1-detected").innerText = "Not Register";

    // Reset player details for Player 2
    document.getElementById("player2-name").innerText = "";
    document.getElementById("player2-category").innerText = "";
    document.getElementById("player2-belt").innerText = "";
    document.getElementById("player2-gym").innerText = "";
    document.querySelector(".player2-detected").innerText = "Not Register";

    // Reset submission status (if using hidden inputs)
    if (document.getElementById("player1-submit")) {
      document.getElementById("player1-submit").value = "false";
    }
    if (document.getElementById("player2-submit")) {
      document.getElementById("player2-submit").value = "false";
    }

    console.log("Game reset. Ready for a new match.");
  }

  function submitScores(playerNumber) {
    // Check if player elements exist
    const playerDetectedElement = document.getElementById(
      `player${playerNumber}-detected`
    );
    if (!playerDetectedElement) {
      console.error(
        `Error: Player ${playerNumber} detection element not found.`
      );
      return;
    }

    // Check if both players are registered
    const player1Registered =
      document.getElementById("player1-detected")?.innerText !==
      "Not Registered";
    const player2Registered =
      document.getElementById("player2-detected")?.innerText !==
      "Not Registered";
    if (!player1Registered || !player2Registered) {
      alert("Error: Both players must be registered before submitting scores!");
      return;
    }

    // Ensure the player has started before submitting score
    if (!playerStarted[playerNumber]) {
      alert(`Error: Player ${playerNumber} has not started yet!`);
      return;
    }

    // Get score elements
    const accuracyScoreElement = document.getElementById(
      `player${playerNumber}-accuracy-score`
    );
    const presentationScoreElement = document.getElementById(
      `player${playerNumber}-presentation-score`
    );
    const totalScoreElement = document.getElementById(
      `player${playerNumber}-total-score`
    );

    if (
      !accuracyScoreElement ||
      !presentationScoreElement ||
      !totalScoreElement
    ) {
      console.error(
        `Error: Score elements for Player ${playerNumber} are missing.`
      );
      return;
    }

    // Get deductions
    const accuracyDeductionElement = document.getElementById(
      `player${playerNumber}-accuracy-deduction`
    );
    const presentationDeductionElement = document.getElementById(
      `player${playerNumber}-presentation-deduction`
    );

    const accuracyDeduction = accuracyDeductionElement
      ? parseFloat(accuracyDeductionElement.value) || 0
      : 0;
    const presentationDeduction = presentationDeductionElement
      ? parseFloat(presentationDeductionElement.value) || 0
      : 0;

    // Calculate new scores
    let newAccuracyScore =
      parseFloat(accuracyScoreElement.innerText) - accuracyDeduction;
    let newPresentationScore =
      parseFloat(presentationScoreElement.innerText) - presentationDeduction;

    // Prevent negative scores
    newAccuracyScore = Math.max(newAccuracyScore, 0);
    newPresentationScore = Math.max(newPresentationScore, 0);

    // Update score elements
    accuracyScoreElement.innerText = newAccuracyScore.toFixed(1);
    presentationScoreElement.innerText = newPresentationScore.toFixed(1);

    // Update total score
    const newTotalScore = newAccuracyScore + newPresentationScore;
    totalScoreElement.innerText = newTotalScore.toFixed(1);

    // Mark as submitted
    const submittedElement = document.getElementById(
      `player${playerNumber}-submit`
    );
    if (submittedElement) {
      submittedElement.value = "true";
    } else {
      console.log(
        `Error: Submission element for Player ${playerNumber} not found.`
      );
    }

    console.log(`✅ Player ${playerNumber} submitted their score.`);

    // Emit updated scores to audience via socket
    socket.emit("update_score", {
      playerNumber: playerNumber,
      accuracy: newAccuracyScore,
      presentation: newPresentationScore,
      total: newTotalScore,
    });
  }

  // Event Listener for Player 1 Submit Button
  document
    .querySelector(".player1-submit")
    .addEventListener("click", function () {
      submitScores(1);

      // Show scores for 5 seconds, then return to waiting-start
      setTimeout(() => {
        socket.emit("game_state", { state: "waiting-start" });
      }, 10000);
    });

  // Event Listener for Player 2 Submit Button
  document
    .querySelector(".player2-submit")
    .addEventListener("click", function () {
      submitScores(2);

      // Show scores for 5 seconds, then transition to waiting-result
      setTimeout(() => {
        socket.emit("game_state", { state: "waiting-result" });
      }, 10000);
    });

  // Event listener for the Display button
  document.querySelector(".displayBtn").addEventListener("click", function () {
    console.log("Display button clicked.");
    displayWinner();
    socket.emit("game_state", { state: "winner-details" });
  });

  document
    .querySelector(".player1-start")
    .addEventListener("click", function () {
      generateRandomScores(1);
      socket.emit("game_state", { state: "player-container" });

      const playerData = {
        playerName: document.getElementById("player1-name").innerText,
        category: document.getElementById("player1-category").innerText,
        belt: document.getElementById("player1-belt").innerText,
        gym: document.getElementById("player1-gym").innerText,
        performance: document.getElementById("player1-performing").innerText,
      };
      console.log("Sending player data:", playerData); // Debugging
      socket.emit("start_game", playerData);
    });

  document
    .querySelector(".player2-start")
    .addEventListener("click", function () {
      if (!playerStarted[1] && !playerSubmitted[1]) {
        alert("Player 1 must start before Player 2!");
        return;
      } else {
        generateRandomScores(2);

        socket.emit("game_state", { state: "player-container" });

        const playerData = {
          playerName: document.getElementById("player2-name").innerText,
          category: document.getElementById("player2-category").innerText,
          belt: document.getElementById("player2-belt").innerText,
          gym: document.getElementById("player2-gym").innerText,
          performance: document.getElementById("player2-performing").innerText,
        };
        console.log("Sending player data:", playerData); // Debugging
        socket.emit("start_game", playerData);
      }
    });

  //=================================================================================================
});
