let db = JSON.parse(localStorage.getItem("densityApp")) || {
  projects: []
};

let currentProject = null;
let currentPage = 0;
let hot;

// ---------- HOME SCREEN ----------
function renderHome() {
  document.body.innerHTML = `
    <h2>Projects</h2>
    <button onclick="createProject()">+ New Project</button>
    <div id="projectList"></div>
  `;

  const list = document.getElementById("projectList");

  db.projects.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerText = p.name;
    div.onclick = () => openProject(i);
    list.appendChild(div);
  });
}

function createProject() {
  const name = prompt("Project name?");
  if (!name) return;

  db.projects.push({
    name,
    pages: []
  });

  save();
  renderHome();
}

function openProject(index) {
  currentProject = index;
  renderApp();
}

// ---------- MAIN APP ----------
function renderApp() {
  document.body.innerHTML = `
    <header>
      <h2>${db.projects[currentProject].name}</h2>
      <button onclick="addPage()">+ Page</button>
      <button onclick="renderHome()">⬅ Back</button>
    </header>

    <div id="tabs"></div>

    <div class="container">

      <div class="form-grid">
        <input placeholder="Project"/>
        <input placeholder="Project #"/>

        <input placeholder="Client"/>
        <input placeholder="Contractor"/>

        <input placeholder="Construction Type"/>
        <input placeholder="Compaction Standard"/>

        <input placeholder="Specified Compaction"/>
        <input placeholder="Specified Moisture"/>

        <input placeholder="Date Tested"/>
        <input placeholder="Tested By"/>

        <input placeholder="Troxler #"/>
        <input placeholder="Temp"/>
      </div>

      <input class="full" placeholder="Soil Description"/>
      <input class="full" placeholder="General Location"/>
      <input class="full" placeholder="Remarks"/>

      <div id="sheet"></div>

    </div>
  `;

  if (db.projects[currentProject].pages.length === 0) {
    addPage();
  } else {
    renderTabs();
    loadPage(0);
  }
}

// ---------- PAGES ----------
function addPage() {
  const newRows = [];

  for (let i = 0; i < 10; i++) {
    newRows.push({
      probe: "",
      location: "",
      depth: "",
      wd1: "", wd2: "", wd3: "",
      dd1: "", dd2: "", dd3: "",
      mc1: "", mc2: "", mc3: "",
      pd: "",
      omc: "",
      density: ""
    });
  }

  db.projects[currentProject].pages.push({
    date: new Date().toISOString().split("T")[0],
    data: newRows
  });

  save();
  renderTabs();
  loadPage(db.projects[currentProject].pages.length - 1);
}

function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";

  db.projects[currentProject].pages.forEach((p, i) => {
    const t = document.createElement("div");
    t.className = "tab" + (i === currentPage ? " active" : "");
    t.innerText = p.date;
    t.onclick = () => loadPage(i);
    tabs.appendChild(t);
  });
}

function loadPage(index) {
  currentPage = index;
  renderTabs();
  createTable(db.projects[currentProject].pages[index].data);
}

// ---------- TABLE ----------
function createTable(data) {
  const container = document.getElementById("sheet");

  if (hot) hot.destroy();

  hot = new Handsontable(container, {
    data,
    colHeaders: [
      "Probe mm", "Location", "Depth m",
      "WD1","WD2","WD3",
      "DD1","DD2","DD3",
      "MC1","MC2","MC3",
      "PD","OMC","% Density"
    ],
    columns: [
      { data: "probe" },
      { data: "location" },
      { data: "depth" },

      { data: "wd1" },{ data: "wd2" },{ data: "wd3" },
      { data: "dd1" },{ data: "dd2" },{ data: "dd3" },
      { data: "mc1" },{ data: "mc2" },{ data: "mc3" },

      { data: "pd" },
      { data: "omc" },

      {
        data: "density",
        readOnly: true
      }
    ],
    rowHeaders: true,
    licenseKey: "non-commercial-and-evaluation",

    afterChange: () => calculate()
  });

  calculate();
}

// ---------- CALCULATIONS ----------
function calculate() {
  const data = hot.getSourceData();

  data.forEach(row => {
    const ddVals = [row.dd1, row.dd2, row.dd3]
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    const avgDD = ddVals.length
      ? ddVals.reduce((a,b) => a+b,0)/ddVals.length
      : 0;

    const pd = parseFloat(row.pd);

    let density = 0;
    if (!isNaN(pd) && pd !== 0) {
      density = (avgDD / pd) * 100;
    }

    row.density = density.toFixed(2);
  });

  hot.render();

  db.projects[currentProject].pages[currentPage].data = data;
  save();
}

// ---------- SAVE ----------
function save() {
  localStorage.setItem("densityApp", JSON.stringify(db));
}

// INIT
renderHome();

//--------- Delete Page ------
function deletePage() {
  if (!confirm("Delete this page?")) return;

  db.projects[currentProject].pages.splice(currentPage, 1);

  if (db.projects[currentProject].pages.length === 0) {
    addPage();
  } else {
    loadPage(0);
  }

  save();
  renderTabs();
}

function deleteProject() {
  if (!confirm("Delete this project?")) return;

  db.projects.splice(currentProject, 1);
  save();
  renderHome();
}
//--------- Print/export --------
function printPage() {
  window.print();
}
