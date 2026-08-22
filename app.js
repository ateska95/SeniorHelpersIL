const STORAGE_KEY = "seniorHelpersILMedicareFirst";
const SAVED_PROFILE_KEY = "seniorHelpersILMember";

const CONFIG = {
  enrollmentUrl: "",
  scheduleUrl: "",
  foodUrl: "https://www.feedingillinois.org/food-resources-illinois",
  chicagoFoodUrl: "https://www.chicagosfoodbank.org/find-food-2/",
  housingUrl: "https://search.211illinois.org/",
  affordableHousingUrl: "https://ilhousingsearch.com/",
  shipUrl: "https://ilaging.illinois.gov/ship.html",
  extraHelpUrl: "https://www.medicare.gov/basics/costs/help/drug-costs",
  mspUrl: "https://www.medicare.gov/basics/costs/help/medicare-savings-programs",
  medicareCompareUrl: "https://www.medicare.gov/plan-compare/"
};

const app = document.getElementById("app");
const pageTitle = document.getElementById("pageTitle");
const pageIntro = document.getElementById("pageIntro");
const stepLabel = document.getElementById("stepLabel");
const stepName = document.getElementById("stepName");
const progressFill = document.getElementById("progressFill");
const profileButton = document.getElementById("profileButton");

let profile = loadProfile();
let savedProfile = loadSavedProfile();
let step = 1;
let view = "flow";

function emptyProfile() {
  return {
    needs: [],
    zip: "",
    timing: { Food: "", Housing: "" },
    medicareStatus: "",
    turning65: "",
    medicaid: "",
    extraHelp: "",
    currentCoverage: "",
    prescriptions: "",
    doctorImportance: "",
    doctorNames: "",
    drugNames: "",
    priorities: [],
    compareTiming: "",
    identity: {
      saved: false,
      name: "",
      dob: "",
      createdAt: "",
      updatedAt: ""
    },
    contact: {
      email: "",
      phone: "",
      emailPlan: false,
      medicareContact: false,
      consentVersion: "2026-08-22-v1",
      consentTimestamp: "",
      consentText: ""
    }
  };
}

function loadProfile() {
  try {
    const base = emptyProfile();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return {
      ...base,
      ...saved,
      timing: { ...base.timing, ...(saved.timing || {}) },
      identity: { ...base.identity, ...(saved.identity || {}) },
      contact: { ...base.contact, ...(saved.contact || {}) }
    };
  } catch {
    return emptyProfile();
  }
}

function loadSavedProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_PROFILE_KEY));
    return saved?.identity?.saved ? saved : null;
  } catch {
    return null;
  }
}

function saveProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  if (profile.identity.saved) {
    profile.identity.updatedAt = new Date().toISOString();
    localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profile));
    savedProfile = JSON.parse(JSON.stringify(profile));
  }
  updateProfileButton();
}

function updateProfileButton() {
  profileButton.hidden = !savedProfile;
}

function setHeader(title, intro, currentStep) {
  const names = ["Choose help", "Your ZIP", "Medicare checkup", "Your plan"];
  pageTitle.textContent = title;
  pageIntro.textContent = intro;
  stepLabel.textContent = `Step ${currentStep} of 4`;
  stepName.textContent = names[currentStep - 1];
  progressFill.style.width = `${currentStep * 25}%`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  updateProfileButton();
  if (view === "profile") return renderProfile();
  if (step === 1) return renderStepOne();
  if (step === 2) return renderStepTwo();
  if (step === 3) return renderStepThree();
  return renderStepFour();
}

function renderStepOne() {
  setHeader("How can we help today?", "Choose every area that matters.", 1);
  const choices = [
    {
      name: "Medicare",
      note: "Compare coverage, costs, and benefits.",
      featured: true
    },
    { name: "Food", note: "Find food and grocery support." },
    { name: "Housing", note: "Find housing and shelter support." }
  ];

  app.innerHTML = `
    <form id="needsForm">
      <div class="choice-grid">
        ${choices.map(choice => choiceCard(choice)).join("")}
      </div>
      <p class="error" id="needsError" hidden>Choose at least one area.</p>
      <div class="actions">
        <button class="button" type="submit">Continue <span class="button-arrow">→</span></button>
      </div>
    </form>
  `;
  bindChoiceCards();
  document.getElementById("needsForm").addEventListener("submit", event => {
    event.preventDefault();
    const selected = selectedCheckboxes("need");
    if (!selected.length) {
      document.getElementById("needsError").hidden = false;
      return;
    }
    profile.needs = selected;
    saveProfile();
    step = 2;
    render();
  });
}

function renderStepTwo() {
  setHeader("Where do you live?", "Your ZIP finds Illinois resources.", 2);
  app.innerHTML = `
    <form class="form-card" id="zipForm">
      <div class="field">
        <label class="field-label" for="zip">Illinois ZIP code</label>
        <input class="zip-input" id="zip" maxlength="5" inputmode="numeric" autocomplete="postal-code" value="${escapeHtml(profile.zip)}" placeholder="60625" required />
        <p class="field-help">We use this for local results.</p>
        <p class="error" id="zipError" hidden>Enter a valid Illinois ZIP.</p>
      </div>
      <div class="actions split">
        <button class="button secondary" id="backButton" type="button">← Back</button>
        <button class="button" type="submit">Continue <span class="button-arrow">→</span></button>
      </div>
    </form>
  `;
  document.getElementById("backButton").addEventListener("click", goBack);
  document.getElementById("zipForm").addEventListener("submit", event => {
    event.preventDefault();
    const zip = document.getElementById("zip").value.trim();
    if (!/^6\d{4}$/.test(zip)) {
      document.getElementById("zipError").hidden = false;
      return;
    }
    profile.zip = zip;
    saveProfile();
    step = 3;
    render();
  });
}

function renderStepThree() {
  setHeader("Let's check your Medicare.", "These answers guide your next steps.", 3);
  const localNeeds = profile.needs.filter(need => ["Food", "Housing"].includes(need));

  app.innerHTML = `
    <form class="form-card" id="checkupForm">
      <div class="section-heading">
        <span class="resource-kicker">Medicare status</span>
        <h2>Start with your current coverage.</h2>
      </div>

      <div class="form-section">
        ${radioGroup("Do you have Medicare Part A and B?", "medicareStatus", profile.medicareStatus, ["Yes", "No", "Not sure"])}
        <div id="turning65Wrap" ${profile.medicareStatus === "No" ? "" : "hidden"}>
          ${radioGroup("Are you turning 65 soon?", "turning65", profile.turning65, ["Within six months", "Later", "Not sure"])}
        </div>
      </div>

      <div class="form-section" id="medicareDetails">
        ${radioGroup("Do you also have Medicaid?", "medicaid", profile.medicaid, ["Yes", "No", "Not sure"])}
        ${radioGroup("Do you get Extra Help?", "extraHelp", profile.extraHelp, ["Yes", "No", "Not sure"])}
        ${radioGroup("How do you get Medicare today?", "currentCoverage", profile.currentCoverage, ["Medicare Advantage", "Original Medicare", "Not sure"])}
      </div>

      <div class="form-section">
        <div class="section-heading">
          <span class="resource-kicker">Your priorities</span>
          <h2>What matters most?</h2>
        </div>
        <p class="field-help">You can add doctors and medicines later.</p>
        <p class="field-help">Choose every important priority.</p>
        <div class="priority-grid">
          ${priorityCard("Keep my doctors")}
          ${priorityCard("Lower drug costs")}
          ${priorityCard("Lower medical costs")}
          ${priorityCard("Dental coverage")}
          ${priorityCard("Vision coverage")}
          ${priorityCard("Food or OTC benefits")}
          ${priorityCard("Provider flexibility")}
          ${priorityCard("Simple plan rules")}
        </div>
      </div>

      <div class="form-section">
        ${radioGroup("When should we compare plans?", "compareTiming", profile.compareTiming, ["Now", "Later", "Just learning"])}
      </div>

      ${localNeeds.length ? `
        <div class="form-section">
          <div class="section-heading">
            <span class="resource-kicker">Other support</span>
            <h2>How soon do you need help?</h2>
          </div>
          ${localNeeds.map(timingGroup).join("")}
        </div>
      ` : ""}

      <p class="error" id="checkupError" hidden></p>
      <div class="actions split">
        <button class="button secondary" id="backButton" type="button">← Back</button>
        <button class="button" type="submit">See my next steps <span class="button-arrow">→</span></button>
      </div>
    </form>
  `;

  bindSegments();
  bindPriorityCards();
  bindMedicareStatusToggle();
  document.getElementById("backButton").addEventListener("click", goBack);
  document.getElementById("checkupForm").addEventListener("submit", event => {
    event.preventDefault();
    const medicareStatus = selectedRadio("medicareStatus");
    const error = document.getElementById("checkupError");
    error.hidden = true;

    if (!medicareStatus) return showError(error, "Choose your Medicare status.");

    profile.medicareStatus = medicareStatus;
    profile.turning65 = selectedRadio("turning65") || "";
    profile.medicaid = selectedRadio("medicaid") || "";
    profile.extraHelp = selectedRadio("extraHelp") || "";
    profile.currentCoverage = selectedRadio("currentCoverage") || "";
    profile.compareTiming = selectedRadio("compareTiming") || "";
    profile.priorities = selectedCheckboxes("priority");

    if (medicareStatus === "Yes") {
      if (!profile.medicaid) return showError(error, "Choose your Medicaid status.");
      if (!profile.extraHelp) return showError(error, "Choose your Extra Help status.");
      if (!profile.currentCoverage) return showError(error, "Choose your current coverage.");
      if (!profile.compareTiming) return showError(error, "Choose when to compare plans.");
    }

    for (const need of localNeeds) {
      const value = selectedRadio(`timing-${need}`);
      if (!value) return showError(error, `Choose timing for ${need}.`);
      profile.timing[need] = value;
    }

    saveProfile();
    step = 4;
    render();
  });
}

function renderStepFour() {
  const name = profile.identity.name?.trim();
  const title = name ? `${firstName(name)}'s Action Plan` : "Your Action Plan";
  setHeader(title, "Follow these steps to find savings.", 4);

  const resources = buildResources();
  app.innerHTML = `
    <div class="results-layout">
      ${stickyProfileMarkup()}
      ${savingsRoadmapMarkup()}
      ${medicareResultMarkup()}

      ${resources.length ? `
        <section class="summary-card">
          <span class="resource-kicker">Illinois support</span>
          <h2>Other helpful next steps</h2>
          <div class="resource-grid" style="margin-top:1rem;">
            ${resources.map((resource, index) => resourceCard(resource, index + 1)).join("")}
          </div>
        </section>
      ` : ""}

      ${contactMarkup()}
      ${profileMarkup()}
      ${questionsMarkup()}

      <div class="actions split">
        <button class="button secondary" id="backButton" type="button">← Update answers</button>
        <button class="button secondary" id="restartPlanButton" type="button">Start new plan</button>
      </div>

      ${shipMarkup()}
    </div>
  `;

  document.getElementById("backButton").addEventListener("click", goBack);
  document.getElementById("restartPlanButton").addEventListener("click", restart);
  bindStickyProfile();
  bindEnrollmentLinks();
  bindContactForm();
  bindProfileForm();
}

function stickyProfileMarkup() {
  if (profile.identity.saved) {
    return `
      <aside class="sticky-profile-bar saved" aria-label="Saved profile">
        <div>
          <strong>${escapeHtml(firstName(profile.identity.name))}'s profile is saved.</strong>
          <span>Your details are ready next time.</span>
        </div>
        <button class="button small" id="stickyProfileButton" type="button">View My Profile</button>
      </aside>
    `;
  }
  return `
    <aside class="sticky-profile-bar" aria-label="Save your profile">
      <div>
        <strong>Save your progress.</strong>
        <span>Return later without starting over.</span>
      </div>
      <button class="button small" id="stickyProfileButton" type="button">Save My Profile</button>
    </aside>
  `;
}

function bindStickyProfile() {
  const button = document.getElementById("stickyProfileButton");
  if (!button) return;
  button.addEventListener("click", () => {
    if (profile.identity.saved) {
      view = "profile";
      render();
      return;
    }
    document.getElementById("profileSection")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("profileName")?.focus(), 350);
  });
}

function savingsRoadmapMarkup() {
  if (profile.medicareStatus !== "Yes") return "";
  const helpStatus = profile.extraHelp === "Yes" || profile.medicaid === "Yes";
  return `
    <section class="roadmap-card" aria-labelledby="roadmapTitle">
      <span class="resource-kicker">Your savings roadmap</span>
      <h2 id="roadmapTitle">Four steps to lower Medicare costs.</h2>
      <p class="roadmap-intro">Check every savings path before enrolling.</p>
      <div class="roadmap-list">
        <article class="roadmap-step">
          <span class="roadmap-number">1</span>
          <div>
            <h3>Check assistance first</h3>
            <p>${helpStatus ? "You already reported financial assistance." : "Extra Help may lower prescription costs."}</p>
            <div class="roadmap-links">
              ${profile.extraHelp !== "Yes" ? `<a href="${CONFIG.extraHelpUrl}" target="_blank" rel="noopener">Check Extra Help →</a>` : ""}
              ${profile.medicaid !== "Yes" ? `<a href="${CONFIG.mspUrl}" target="_blank" rel="noopener">Check Medicare savings →</a>` : ""}
            </div>
          </div>
        </article>
        <article class="roadmap-step">
          <span class="roadmap-number">2</span>
          <div>
            <h3>Review what you pay</h3>
            <p>Look at premiums, copays, and prescriptions.</p>
          </div>
        </article>
        <article class="roadmap-step">
          <span class="roadmap-number">3</span>
          <div>
            <h3>Compare Medicare options</h3>
            <p>Compare total costs and important benefits.</p>
            <a href="#" data-enrollment>Compare Medicare plans →</a>
          </div>
        </article>
        <article class="roadmap-step">
          <span class="roadmap-number">4</span>
          <div>
            <h3>Enroll only if it helps</h3>
            <p>Change coverage only when another plan fits.</p>
          </div>
        </article>
      </div>
    </section>
  `;
}

function shipMarkup() {
  return `
    <section class="ship-footer-card">
      <span class="resource-kicker">Independent Medicare help</span>
      <h2>Want free, neutral Medicare counseling?</h2>
      <p>Illinois SHIP offers free Medicare counseling.</p>
      <a href="${CONFIG.shipUrl}" target="_blank" rel="noopener">Visit Illinois SHIP →</a>
    </section>
  `;
}

function medicareResultMarkup() {
  if (profile.medicareStatus === "Yes") {
    const matchItems = [];
    if (profile.identity.saved && profile.doctorNames) {
      matchItems.push(["Doctors", "Check every important provider."]);
    }
    if (profile.identity.saved && profile.drugNames) {
      matchItems.push(["Prescriptions", "Compare coverage and yearly costs."]);
    }
    if (profile.medicaid === "Yes") {
      matchItems.push(["Medicaid", "Include dual-eligible plan options."]);
    }
    if (profile.extraHelp !== "Yes") {
      matchItems.push(["Savings", "Check Extra Help eligibility."]);
    }
    const priorities = profile.priorities.slice(0, 4);
    priorities.forEach(item => matchItems.push([item, "Include this during comparison."]));

    return `
      <section class="medical-cta">
        <span class="resource-kicker">Medicare checkup</span>
        <h2>You're ready for plan comparison.</h2>
        <p>${profile.identity.saved ? "Your saved profile can personalize matching." : "Create a profile before adding doctors or medicines."}</p>
        <div class="match-list">
          ${matchItems.slice(0, 6).map(([title, text]) => `
            <div class="match-item">
              <strong>${escapeHtml(title)}</strong>
              <span>${escapeHtml(text)}</span>
            </div>
          `).join("")}
        </div>
        <div class="medical-actions">
          <a class="button" href="#" data-enrollment>Compare Medicare plans →</a>
          <button class="button secondary" type="button" data-schedule>Schedule a call</button>
        </div>
        <p class="external-note">Self-service enrollment remains the main path.</p>
      </section>
      ${profile.extraHelp !== "Yes" ? `
        <div class="checkup-banner">
          <strong>Prescription help may be available.</strong>
          <p>Extra Help can lower drug costs.</p>
          <a href="${CONFIG.extraHelpUrl}" target="_blank" rel="noopener">Check Extra Help →</a>
        </div>
      ` : ""}
      ${profile.medicaid === "No" || profile.medicaid === "Not sure" ? `
        <div class="checkup-banner">
          <strong>Medicare costs may be reduced.</strong>
          <p>Savings Programs can help eligible members.</p>
          <a href="${CONFIG.mspUrl}" target="_blank" rel="noopener">Check Medicare savings →</a>
        </div>
      ` : ""}
    `;
  }

  if (profile.medicareStatus === "No") {
    const soon = profile.turning65 === "Within six months";
    return `
      <section class="medical-cta">
        <span class="resource-kicker">Medicare status</span>
        <h2>${soon ? "Prepare for Medicare early." : "Medicare enrollment comes later."}</h2>
        <p>${soon ? "You can prepare before coverage starts." : "Your local support still comes first."}</p>
        <div class="medical-actions">
          <a class="button" href="https://www.medicare.gov/basics/get-started-with-medicare" target="_blank" rel="noopener">Learn Medicare basics →</a>
          <button class="button secondary" type="button" data-schedule>Schedule a call</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="medical-cta">
      <span class="resource-kicker">Medicare status</span>
      <h2>Let's confirm your Medicare status.</h2>
      <p>Start with your Medicare information.</p>
      <div class="medical-actions">
        <a class="button" href="https://www.medicare.gov/basics/get-started-with-medicare" target="_blank" rel="noopener">Review Medicare basics →</a>
        <button class="button secondary" type="button" data-schedule>Schedule a call</button>
      </div>
    </section>
  `;
}

function buildResources() {
  const resources = [];
  if (profile.needs.includes("Food")) {
    const urgent = profile.timing.Food === "Now";
    resources.push({
      priority: urgent,
      category: "Food",
      title: urgent ? "Find food today" : "Find food near you",
      text: "Search trusted Illinois food resources.",
      button: "Find food",
      url: foodUrlForZip(profile.zip)
    });
  }
  if (profile.needs.includes("Housing")) {
    const urgent = profile.timing.Housing === "Now";
    resources.push({
      priority: urgent,
      category: "Housing",
      title: urgent ? "Find housing help now" : "Find local housing help",
      text: "211 can connect local housing support.",
      button: "Search housing help",
      url: CONFIG.housingUrl
    });
    if (!urgent) {
      resources.push({
        category: "Housing",
        title: "Search affordable housing",
        text: "Search Illinois rental housing by ZIP.",
        button: "Search housing",
        url: CONFIG.affordableHousingUrl
      });
    }
  }
  return resources;
}

function contactMarkup() {
  const c = profile.contact;
  return `
    <section class="contact-card" aria-labelledby="contactTitle">
      <span class="resource-kicker">Save your plan</span>
      <h2 id="contactTitle">Keep your next steps.</h2>
      <p class="field-help">Contact information remains optional.</p>
      <form id="contactForm" style="margin-top:1rem;">
        <div class="contact-grid">
          <div class="field">
            <label class="field-label" for="email">Email</label>
            <input class="text-input" id="email" type="email" autocomplete="email" value="${escapeHtml(c.email)}" placeholder="mary@example.com" />
          </div>
          <div class="field">
            <label class="field-label" for="phone">Cell phone</label>
            <input class="text-input" id="phone" type="tel" autocomplete="tel" value="${escapeHtml(c.phone)}" placeholder="(312) 555-0123" />
          </div>
        </div>

        <label class="consent-option">
          <input id="emailPlan" type="checkbox" ${c.emailPlan ? "checked" : ""} />
          <span>
            <strong>Email my Action Plan.</strong>
            <span>This does not allow Medicare marketing.</span>
          </span>
        </label>

        <label class="consent-option">
          <input id="medicareContact" type="checkbox" ${c.medicareContact ? "checked" : ""} />
          <span>
            <strong>SeniorHelpersIL may contact me about Medicare.</strong>
            <span>Calls, texts, and emails may be used.</span>
          </span>
        </label>

        <details class="consent-details">
          <summary>Important consent details</summary>
          <p>Consent is not required for services.</p>
          <p>Consent is not required for enrollment.</p>
          <p>Automated technology may contact you.</p>
          <p>Message and data rates may apply.</p>
          <p>Reply STOP to end text messages.</p>
        </details>

        <p class="error" id="contactError" hidden></p>
        <p class="saved-note" id="contactSaved" hidden>Contact choices saved.</p>
        <div class="actions">
          <button class="button secondary" type="submit">Save contact choices</button>
        </div>
      </form>
    </section>
  `;
}

function profileMarkup() {
  if (profile.identity.saved) {
    return `
      <section class="profile-card" id="profileSection">
        <span class="resource-kicker">Saved profile</span>
        <h2>${escapeHtml(profile.identity.name)}'s profile</h2>
        <p class="field-help">Add doctors and medicines when ready.</p>
        <div class="actions">
          <button class="button secondary" id="openProfileButton" type="button">View my profile</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="profile-card profile-save-card" id="profileSection">
      <span class="resource-kicker">Save your progress</span>
      <h2>Save your Medicare profile.</h2>
      <p class="field-help">Return later without starting over.</p>
      <form id="profileForm" style="margin-top:1rem;">
        <div class="contact-grid">
          <div class="field">
            <label class="field-label" for="profileName">Your name</label>
            <input class="text-input" id="profileName" autocomplete="name" value="${escapeHtml(profile.identity.name)}" placeholder="Mary Smith" />
          </div>
          <div class="field">
            <label class="field-label" for="profileDob">Birthday</label>
            <input class="text-input" id="profileDob" type="date" autocomplete="bday" value="${escapeHtml(profile.identity.dob)}" />
          </div>
        </div>
        <p class="error" id="profileError" hidden></p>
        <div class="actions">
          <button class="button" type="submit">Save My Profile</button>
        </div>
      </form>
    </section>
  `;
}

function questionsMarkup() {
  const topics = [
    {
      title: "Medicare basics",
      questions: [
        ["What is Medicare Advantage?", "Private plans replace Original Medicare coverage. Most include drug coverage.", "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options"],
        ["Do I need an agent?", "No. You can enroll online yourself. Help remains available.", CONFIG.medicareCompareUrl],
        ["Can I change plans anytime?", "No. Medicare uses specific enrollment periods. Some people qualify separately.", "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan"]
      ]
    },
    {
      title: "Doctors and prescriptions",
      questions: [
        ["Can I keep my doctor?", "Only if your plan supports them. Check networks before enrolling.", "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/your-coverage-options/compare-original-medicare-medicare-advantage"],
        ["Will my medicines be covered?", "Each plan uses a drug list. Compare every prescription first.", "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan"]
      ]
    },
    {
      title: "Costs and assistance",
      questions: [
        ["Does $0 premium mean free?", "No. You still pay Medicare costs. Copays may also apply.", "https://www.medicare.gov/basics/costs/medicare-costs"],
        ["What is Extra Help?", "Extra Help lowers Medicare drug costs. Income rules apply.", CONFIG.extraHelpUrl],
        ["What are Medicare Savings Programs?", "They may help pay Medicare costs. Illinois determines eligibility.", CONFIG.mspUrl]
      ]
    },
    {
      title: "Choosing a plan",
      questions: [
        ["HMO or PPO?", "HMOs usually use tighter provider networks. PPOs offer more flexibility.", "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options/compare"],
        ["Do food benefits come automatically?", "No. Benefits vary by plan and eligibility. Review rules carefully.", "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options"],
        ["What should I compare first?", "Start with doctors, medicines, costs, and benefits. Then compare plans.", "https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan"]
      ]
    }
  ];

  return `
    <section class="questions-card">
      <span class="resource-kicker">Quick answers</span>
      <h2>Common Medicare questions</h2>
      ${topics.map(topic => `
        <div class="topic-block">
          <div class="topic-title">${escapeHtml(topic.title)}</div>
          ${topic.questions.map(([question, answer, url]) => `
            <details>
              <summary>${escapeHtml(question)}</summary>
              <div class="question-body">
                ${answer.split(/(?<=\.)\s+/).map(sentence => `<p>${escapeHtml(sentence)}</p>`).join("")}
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener">Learn more →</a>
              </div>
            </details>
          `).join("")}
        </div>
      `).join("")}
    </section>
  `;
}

function renderProfile() {
  if (!savedProfile) {
    view = "flow";
    return render();
  }
  const m = savedProfile;
  pageTitle.textContent = `Welcome back, ${firstName(m.identity.name)}.`;
  pageIntro.textContent = "Your Medicare profile is ready.";
  stepLabel.textContent = "Saved profile";
  stepName.textContent = "Your information";
  progressFill.style.width = "100%";

  app.innerHTML = `
    <div class="profile-stack">
      <section class="profile-card">
        <span class="resource-kicker">Medicare profile</span>
        <h2>${escapeHtml(m.identity.name)}</h2>
        <div class="profile-grid">
          <div class="profile-stat"><span>ZIP</span><strong>${escapeHtml(m.zip || "Not added")}</strong></div>
          <div class="profile-stat"><span>Medicare</span><strong>${escapeHtml(m.medicareStatus || "Not answered")}</strong></div>
          <div class="profile-stat"><span>Medicaid</span><strong>${escapeHtml(m.medicaid || "Not answered")}</strong></div>
          <div class="profile-stat"><span>Extra Help</span><strong>${escapeHtml(m.extraHelp || "Not answered")}</strong></div>
          <div class="profile-stat"><span>Coverage</span><strong>${escapeHtml(m.currentCoverage || "Not answered")}</strong></div>
          <div class="profile-stat"><span>Compare</span><strong>${escapeHtml(m.compareTiming || "Not answered")}</strong></div>
        </div>
      </section>

      <section class="profile-card">
        <span class="resource-kicker">Personalize Medicare</span>
        <h2>Add healthcare details.</h2>
        <p class="field-help">These details improve future plan matching.</p>
        <form id="healthProfileForm" style="margin-top:1rem;">
          <div class="field">
            <label class="field-label" for="profileDoctorNames">Important doctors</label>
            <textarea class="text-area" id="profileDoctorNames" placeholder="Dr. Jane Smith">${escapeHtml(m.doctorNames || "")}</textarea>
            <p class="field-help">Add doctors you want to keep.</p>
          </div>
          <div class="field">
            <label class="field-label" for="profileDrugNames">Prescription names</label>
            <textarea class="text-area" id="profileDrugNames" placeholder="Eliquis, Metformin">${escapeHtml(m.drugNames || "")}</textarea>
            <p class="field-help">Add medicines you take regularly.</p>
          </div>
          <p class="saved-note" id="healthProfileSaved" hidden>Healthcare details saved.</p>
          <div class="actions">
            <button class="button secondary" type="submit">Save healthcare details</button>
          </div>
        </form>
        <ul class="profile-list">
          <li><strong>Priorities:</strong> ${escapeHtml(m.priorities.join(", ") || "None added")}</li>
        </ul>
      </section>

      <section class="profile-card">
        <span class="resource-kicker">Future profile</span>
        <h2>More details can be added.</h2>
        <ul class="summary-list">
          <li class="pill">Preferred pharmacy</li>
          <li class="pill">Specialists</li>
          <li class="pill">Income</li>
          <li class="pill">Benefit usage</li>
          <li class="pill">New support needs</li>
        </ul>
      </section>

      <div class="actions split">
        <button class="button secondary" id="profileHomeButton" type="button">Back home</button>
        <button class="button" id="resumeButton" type="button">Update my checkup</button>
      </div>
    </div>
  `;

  document.getElementById("profileHomeButton").addEventListener("click", () => {
    view = "flow";
    step = 1;
    render();
  });
  document.getElementById("resumeButton").addEventListener("click", () => {
    profile = JSON.parse(JSON.stringify(savedProfile));
    view = "flow";
    step = 3;
    render();
  });

  const healthForm = document.getElementById("healthProfileForm");
  if (healthForm) {
    healthForm.addEventListener("submit", event => {
      event.preventDefault();
      savedProfile.doctorNames = document.getElementById("profileDoctorNames").value.trim();
      savedProfile.drugNames = document.getElementById("profileDrugNames").value.trim();
      savedProfile.identity.updatedAt = new Date().toISOString();
      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(savedProfile));
      if (profile.identity.saved) {
        profile.doctorNames = savedProfile.doctorNames;
        profile.drugNames = savedProfile.drugNames;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
      document.getElementById("healthProfileSaved").hidden = false;
    });
  }
}

function choiceCard(choice) {
  const checked = profile.needs.includes(choice.name);
  return `
    <label class="choice-card ${choice.featured ? "featured" : ""} ${checked ? "selected" : ""}">
      <input type="checkbox" name="need" value="${escapeHtml(choice.name)}" ${checked ? "checked" : ""} />
      <span class="choice-icon" aria-hidden="true">${iconFor(choice.name)}</span>
      <span>
        <span class="choice-title">${escapeHtml(choice.name)}</span>
        <span class="choice-note">${escapeHtml(choice.note)}</span>
      </span>
      <span class="choice-check">✓</span>
    </label>
  `;
}

function radioGroup(question, name, current, options) {
  return `
    <div class="field">
      <span class="group-label">${escapeHtml(question)}</span>
      <div class="segment-grid ${options.length === 2 ? "two" : ""}">
        ${options.map(option => `
          <label class="segment ${current === option ? "selected" : ""}">
            <input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(option)}" ${current === option ? "checked" : ""} />
            <span>${escapeHtml(option)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function priorityCard(label) {
  const checked = profile.priorities.includes(label);
  return `
    <label class="priority-card ${checked ? "selected" : ""}">
      <input type="checkbox" name="priority" value="${escapeHtml(label)}" ${checked ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function timingGroup(need) {
  const labels = need === "Food"
    ? ["Today", "This week", "Later", "Just exploring"]
    : ["Right now", "Within days", "Within weeks", "Just exploring"];
  const current = profile.timing[need] || "";
  return `
    <div class="timing-group">
      <div class="timing-label">How soon for ${escapeHtml(need.toLowerCase())}?</div>
      <div class="timing-options">
        ${labels.map(label => `
          <label class="segment ${current === normalizeTiming(label) ? "selected" : ""}">
            <input type="radio" name="timing-${escapeHtml(need)}" value="${normalizeTiming(label)}" ${current === normalizeTiming(label) ? "checked" : ""} />
            <span>${escapeHtml(label)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function resourceCard(resource, number) {
  return `
    <article class="resource-card ${resource.priority ? "priority" : ""}">
      <div class="resource-top">
        <div>
          <span class="resource-kicker">${resource.priority ? "Urgent · " : ""}${escapeHtml(resource.category)}</span>
          <h3>${escapeHtml(resource.title)}</h3>
        </div>
        <span class="resource-number">${number}</span>
      </div>
      <p>${escapeHtml(resource.text)}</p>
      <a class="button full" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener">${escapeHtml(resource.button)} →</a>
      <span class="external-note">Opens a trusted resource website.</span>
    </article>
  `;
}

function bindChoiceCards() {
  document.querySelectorAll(".choice-card").forEach(card => {
    const input = card.querySelector("input");
    input.addEventListener("change", () => card.classList.toggle("selected", input.checked));
  });
}

function bindSegments() {
  document.querySelectorAll(".segment input").forEach(input => {
    input.addEventListener("change", () => {
      document.querySelectorAll(`input[name="${CSS.escape(input.name)}"]`).forEach(peer => {
        peer.closest(".segment")?.classList.toggle("selected", peer.checked);
      });
    });
  });
}

function bindPriorityCards() {
  document.querySelectorAll(".priority-card input").forEach(input => {
    input.addEventListener("change", () => input.closest(".priority-card").classList.toggle("selected", input.checked));
  });
}

function bindMedicareStatusToggle() {
  document.querySelectorAll('input[name="medicareStatus"]').forEach(input => {
    input.addEventListener("change", () => {
      document.getElementById("turning65Wrap").hidden = input.value !== "No";
    });
  });
}

function bindEnrollmentLinks() {
  document.querySelectorAll("[data-enrollment]").forEach(link => {
    link.addEventListener("click", event => {
      if (!CONFIG.enrollmentUrl) {
        event.preventDefault();
        alert("Demo only. Add your SunFire enrollment link.");
      }
    });
  });
  document.querySelectorAll("[data-schedule]").forEach(button => {
    button.addEventListener("click", () => {
      if (CONFIG.scheduleUrl) window.open(CONFIG.scheduleUrl, "_blank", "noopener");
      else alert("Demo only. Add your scheduling link.");
    });
  });
}

function bindContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const emailPlan = document.getElementById("emailPlan").checked;
    const medicareContact = document.getElementById("medicareContact").checked;
    const error = document.getElementById("contactError");
    error.hidden = true;

    if (emailPlan && !validEmail(email)) return showError(error, "Enter a valid email address.");
    if (medicareContact && !validPhone(phone) && !validEmail(email)) {
      return showError(error, "Add a valid phone or email.");
    }

    const consentText = "SeniorHelpersIL may contact me about Medicare. Calls, texts, and emails may be used. Consent is not required for services or enrollment.";
    profile.contact = {
      email,
      phone,
      emailPlan,
      medicareContact,
      consentVersion: "2026-08-22-v1",
      consentTimestamp: medicareContact ? new Date().toISOString() : "",
      consentText: medicareContact ? consentText : ""
    };
    saveProfile();
    document.getElementById("contactSaved").hidden = false;
  });
}

function bindProfileForm() {
  const open = document.getElementById("openProfileButton");
  if (open) open.addEventListener("click", () => { view = "profile"; render(); });

  const form = document.getElementById("profileForm");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("profileName").value.trim();
    const dob = document.getElementById("profileDob").value;
    const error = document.getElementById("profileError");
    error.hidden = true;
    if (name.length < 2) return showError(error, "Enter your name.");
    if (!validBirthDate(dob)) return showError(error, "Enter a valid birthday.");
    const now = new Date().toISOString();
    profile.identity = {
      saved: true,
      name,
      dob,
      createdAt: profile.identity.createdAt || now,
      updatedAt: now
    };
    saveProfile();
    render();
  });
}

function selectedCheckboxes(name) {
  return [...document.querySelectorAll(`input[name="${CSS.escape(name)}"]:checked`)].map(input => input.value);
}
function selectedRadio(name) {
  return document.querySelector(`input[name="${CSS.escape(name)}"]:checked`)?.value || "";
}
function normalizeTiming(label) {
  if (["Today", "Right now"].includes(label)) return "Now";
  if (["This week", "Within days"].includes(label)) return "Soon";
  if (["Later", "Within weeks"].includes(label)) return "Later";
  return "Exploring";
}
function foodUrlForZip(zip) {
  return /^606\d{2}$/.test(zip) ? CONFIG.chicagoFoodUrl : CONFIG.foodUrl;
}
function goBack() {
  step = Math.max(1, step - 1);
  render();
}
function restart() {
  profile = emptyProfile();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  view = "flow";
  step = 1;
  render();
}
function firstName(name) {
  return name.trim().split(/\s+/)[0] || "Your";
}
function showError(element, message) {
  element.textContent = message;
  element.hidden = false;
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validPhone(value) {
  return value.replace(/\D/g, "").length >= 10;
}
function validBirthDate(value) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date < new Date();
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}
function iconFor(name) {
  const icons = {
    Medicare: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M12 8v6M9 11h6"/></svg>`,
    Food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18M5 11l1 9h12l1-9M8 7c0-2 1.5-3 4-3s4 1 4 3"/></svg>`,
    Housing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>`
  };
  return icons[name] || "";
}

profileButton.addEventListener("click", () => {
  if (!savedProfile) return;
  view = "profile";
  render();
});
document.getElementById("restartButton").addEventListener("click", restart);
document.getElementById("homeLink").addEventListener("click", event => {
  event.preventDefault();
  view = "flow";
  step = 1;
  render();
});

render();
