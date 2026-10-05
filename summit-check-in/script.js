const GOAL = 50;
const STORAGE_KEY = "intelSummitCheckIn.v1";
const TEAMS = {
  water: { name: "Team Water Wise", countId: "waterCount" },
  zero: { name: "Team Net Zero", countId: "zeroCount" },
  power: { name: "Team Renewables", countId: "powerCount" },
};

const form = document.querySelector("#checkInForm");
const nameInput = document.querySelector("#attendeeName");
const teamSelect = document.querySelector("#teamSelect");
const greeting = document.querySelector("#greeting");
const countDisplay = document.querySelector("#attendeeCount");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const attendeeList = document.querySelector("#attendeeList");
const listTotal = document.querySelector("#listTotal");
const emptyState = document.querySelector("#emptyState");
const celebration = document.querySelector("#celebration");

function readSavedAttendees() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((person) =>
      person && typeof person.name === "string" && TEAMS[person.team]
    );
  } catch {
    return [];
  }
}

let attendees = readSavedAttendees();

function saveAttendees() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
  } catch {
    greeting.textContent = "Your check-in was added, but this browser could not save it.";
    greeting.hidden = false;
  }
}

function getTeamTotals() {
  return attendees.reduce((totals, person) => {
    totals[person.team] += 1;
    return totals;
  }, { water: 0, zero: 0, power: 0 });
}

function updateCelebration(totals) {
  if (attendees.length < GOAL) {
    celebration.hidden = true;
    return;
  }
  const highestCount = Math.max(...Object.values(totals));
  const leaders = Object.entries(totals)
    .filter(([, count]) => count === highestCount)
    .map(([key]) => TEAMS[key].name);
  const winnerText = leaders.length === 1
    ? `${leaders[0]} is leading the turnout`
    : `${leaders.join(" and ")} are tied for the lead`;
  celebration.textContent = `🎉 Attendance goal reached! ${winnerText} with ${highestCount} ${highestCount === 1 ? "attendee" : "attendees"}. Thank you for being part of a more sustainable future!`;
  celebration.hidden = false;
}

function render() {
  const totals = getTeamTotals();
  countDisplay.textContent = attendees.length;
  Object.entries(TEAMS).forEach(([key, team]) => {
    document.getElementById(team.countId).textContent = totals[key];
  });

  const progress = Math.min((attendees.length / GOAL) * 100, 100);
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", Math.min(attendees.length, GOAL));
  progressText.textContent = attendees.length >= GOAL
    ? "Attendance goal reached. Thanks for showing up!"
    : `${GOAL - attendees.length} ${GOAL - attendees.length === 1 ? "attendee" : "attendees"} to go to reach our goal.`;

  listTotal.textContent = `${attendees.length} ${attendees.length === 1 ? "person" : "people"}`;
  emptyState.hidden = attendees.length > 0;
  attendeeList.replaceChildren();
  attendees.forEach((person) => {
    const item = document.createElement("li");
    item.className = "attendee-item";
    const personName = document.createElement("span");
    personName.className = "attendee-name";
    personName.textContent = person.name;
    const personTeam = document.createElement("span");
    personTeam.className = "attendee-team";
    personTeam.textContent = TEAMS[person.team].name;
    item.append(personName, personTeam);
    attendeeList.append(item);
  });
  updateCelebration(totals);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  if (!name || !TEAMS[team]) return;

  attendees.push({ name, team });
  saveAttendees();
  render();
  greeting.textContent = `Welcome to the summit, ${name}! You're checked in with ${TEAMS[team].name}.`;
  greeting.hidden = false;
  form.reset();
  nameInput.focus();
});

render();
