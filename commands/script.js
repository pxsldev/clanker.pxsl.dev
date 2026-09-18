const grid = document.getElementById("commandsGrid");
const search = document.getElementById("search");
const count = document.getElementById("count");

const heroCommandCount = document.getElementById("heroCommandCount");
const commandTotal = document.getElementById("commandTotal");
const categoryTotal = document.getElementById("categoryTotal");

let commands = [];

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatChoices(choices) {
  if (!choices || choices.length === 0) {
    return "";
  }

  return `
    <div style="margin-top: 6px;">
      <strong>Choices:</strong><br>
      ${choices.map(choice => {
        return `• ${escapeHTML(choice.name)} → <code>${escapeHTML(choice.value)}</code>`;
      }).join("<br>")}
    </div>
  `;
}

function formatOptions(options) {
  if (!options || options.length === 0) {
    return "";
  }

  return options.map(opt => {
    const required = opt.required
      ? "required"
      : "optional";

    const description = opt.description
      ? ` — ${escapeHTML(opt.description)}`
      : "";

    const choices = formatChoices(opt.choices);

    return `
      <div style="margin-bottom: 8px;">
        • <strong>${escapeHTML(opt.name)}</strong>
        (${required})${description}
        ${choices}
      </div>
    `;
  }).join("");
}

function getCategories(commandList) {
  const categories = new Set();

  commandList.forEach(command => {
    const parts = command.name.trim().split(/\s+/);

    if (parts.length > 0 && parts[0]) {
      categories.add(parts[0].toLowerCase());
    }
  });

  return categories;
}

function updateStats() {
  const commandCount = commands.length;
  const categories = getCategories(commands);
  const categoryCount = categories.size;

  if (heroCommandCount) {
    heroCommandCount.textContent = `${commandCount}+`;
  }

  if (commandTotal) {
    commandTotal.textContent = commandCount;
  }

  if (categoryTotal) {
    categoryTotal.textContent = categoryCount;
  }
}

function render(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="command-desc" style="grid-column: 1 / -1; text-align: center;">
        No commands found.
      </div>
    `;

    count.textContent = "0 commands";
    return;
  }

  list.forEach(cmd => {
    const card = document.createElement("div");
    card.className = "command-card";

    const optionsHTML = formatOptions(cmd.options);

    card.innerHTML = `
      <div class="command-name">
        /${escapeHTML(cmd.name)}
      </div>

      <div class="command-desc">
        ${escapeHTML(cmd.description || "No description")}
      </div>

      ${
        optionsHTML
          ? `
            <div class="command-desc" style="margin-top: 8px;">
              <strong>Options:</strong><br>
              ${optionsHTML}
            </div>
          `
          : ""
      }

      <div class="command-tag">
        ${cmd.type === 1 ? "Slash Command" : "Command"}
      </div>
    `;

    grid.appendChild(card);
  });

  count.textContent = `${list.length} commands`;
}

search.addEventListener("input", () => {
  const value = search.value
    .trim()
    .toLowerCase();

  const filtered = commands.filter(command => {
    const name = command.name
      ? command.name.toLowerCase()
      : "";

    const description = command.description
      ? command.description.toLowerCase()
      : "";

    return (
      name.includes(value) ||
      description.includes(value)
    );
  });

  render(filtered);
});

fetch("https://api.pxsl.dev/clanker/commands.json")
  .then(response => {
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) {
      throw new Error(
        "commands.json does not contain an array"
      );
    }

    commands = data;

    updateStats();
    render(commands);

    document.title = `Clanker ~ ${commands.length} Commands`;

    const heroHeading = document.querySelector(
      ".commands-hero h1 span"
    );

    if (heroHeading) {
      heroHeading.textContent = `${commands.length}+ Commands`;
    }

    const ogTitle = document.querySelector(
      'meta[property="og:title"]'
    );

    if (ogTitle) {
      ogTitle.setAttribute(
        "content",
        `Clanker Commands — ${commands.length}+ Discord Bot Commands`
      );
    }

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `Full list of Clanker Discord bot commands including economy, gambling, fun, meme, and utility commands. Explore ${commands.length}+ free commands instantly.`
      );
    }

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );

    if (ogDescription) {
      ogDescription.setAttribute(
        "content",
        `Browse all ${commands.length}+ Clanker commands including economy, games, memes and utility tools.`
      );
    }
  })
  .catch(error => {
    console.error(
      "Failed to load commands:",
      error
    );

    count.textContent =
      "Failed to load commands";

    if (heroCommandCount) {
      heroCommandCount.textContent = "—";
    }

    if (commandTotal) {
      commandTotal.textContent = "—";
    }

    if (categoryTotal) {
      categoryTotal.textContent = "—";
    }
  });