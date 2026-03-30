let db = JSON.parse(localStorage.getItem("densityApp")) || {
  projectName: "Project",
  pages: []
};

let currentPage = 0;
let hot;

// Create first page if none
if (db.pages.length === 0) {
  addPage();
} else {
  renderTabs();
  loadPage(0);
}

function save() {
  localStorage.setItem("densityApp", JSON.stringify(db));
}

// Add new page
function addPage() {
  db.pages.push({
    date: new Date().toISOString().split("T")[0],
    header: {},
    data: Array(10).fill({
      test: "",
      probe: "",
      location: "",
      depth: "",
      wd: "",
      dd: "",
      mc: "",
      pd: ""
    }),
    determined: ""
  });

  save();
  renderTabs();
  loadPage(db.pages.length - 1);
}

// Tabs
function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";

  db.pages.forEach((p, i) => {
    const t = document.createElement("div");
    t.className = "tab" + (i === currentPage ? " active" : "");
    t.innerText = p.date;
    t.onclick = () => loadPage(i);
    tabs.appendChild(t);
  });
}

// Load page
function loadPage(index) {
  currentPage = index;
  renderTabs();

  const page = db.pages[index];

  document.getElementById("determined").value = page.determined || "";

  createTable(page.data);
}

// Spreadsheet
function createTable(data) {
  const container = document.getElementById("sheet");

  if (hot) hot.destroy();

  hot = new Handsontable(container, {
    data,
    colHeaders: ["Test", "Probe", "Location", "Depth", "W.D", "D.D", "M.C", "P.D"],
    columns: [
      { data: "test" },
      { data: "probe" },
      { data: "location" },
      { data: "depth" },
      { data: "wd" },
      { data: "dd" },
      { data: "mc" },
      { data: "pd" }
    ],
    rowHeaders: true,
    licenseKey: "non-commercial-and-evaluation",
    afterChange: () => updateCalculations()
  });

  updateCalculations();
}

// Calculations
function updateCalculations() {
  const data = hot.getData();
  let total = 0;
  let count = 0;

  data.forEach(row => {
    const val = parseFloat(row[5]); // D.D column
    if (!isNaN(val)) {
      total += val;
      count++;
    }
  });

  const avg = count ? total / count : 0;
  document.getElementById("avg").innerText = avg.toFixed(2);

  const determined = parseFloat(document.getElementById("determined").value);
  let percent = 0;

  if (!isNaN(determined) && determined !== 0) {
    percent = (avg / determined) * 100;
  }

  document.getElementById("percent").innerText = percent.toFixed(2);

  // Save data
  db.pages[currentPage].data = hot.getSourceData();
  db.pages[currentPage].determined = determined;

  save();
}

// Update percent when user types
document.getElementById("determined").addEventListener("input", updateCalculations);

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}