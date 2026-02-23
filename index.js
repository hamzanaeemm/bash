const grid = document.getElementById("optionsGrid");
    const commandFilters = document.getElementById("commandFilters");
    const hoverBackdrop = document.getElementById("hoverBackdrop");
    const hoverOverlay = document.getElementById("hoverOverlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlayDesc = document.getElementById("overlayDesc");
    const overlayExample = document.getElementById("overlayExample");
    const overlayContext = document.getElementById("overlayContext");
    const overlayDemo = document.getElementById("overlayDemo");
    const copyToast = document.getElementById("copyToast");

    let copyToastTimer = null;
    let demoRunId = 0;
    let overlayHideTimer = null;
    let overlayShowTimer = null;
    let selectedCommand = "";
    let commandCards = [];
    let commands = [];

    function buildCardsFromDocs(docs) {
      const cards = [];

      Object.entries(docs).forEach(([command, meta]) => {
        const optionMap = meta.options && Object.keys(meta.options).length
          ? meta.options
          : { "(default)": "Runs command with default behavior." };

        Object.entries(optionMap).forEach(([option, optionValue]) => {
          const detail = typeof optionValue === "string"
            ? optionValue
            : (optionValue.description || "No additional option details available.");
          const demoOutput = Array.isArray(optionValue?.demoOutput)
            ? optionValue.demoOutput
            : (typeof optionValue?.demoOutput === "string" ? [optionValue.demoOutput] : []);
          const raw = option === "(default)" ? command : `${command} ${option}`;
          cards.push({
            section: `${command} command`,
            command,
            option,
            detail: detail || "No additional option details available.",
            summary: meta.summary || `Runs the ${command} command.`,
            raw,
            demoOutput
          });
        });
      });

      return cards;
    }

    function showInfo(item) {
      if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
      }

      if (overlayShowTimer) {
        clearTimeout(overlayShowTimer);
      }

      overlayTitle.textContent = `${item.command} ${item.option}`;
      overlayDesc.textContent = `${item.summary} ${item.detail}`;
      overlayExample.textContent = `Example: ${item.raw}`;
      overlayContext.textContent = `Command: ${item.command}`;

      hoverBackdrop.classList.add("show");
      hoverOverlay.classList.add("show");
      hoverBackdrop.setAttribute("aria-hidden", "false");
      hoverOverlay.setAttribute("aria-hidden", "false");

      runTerminalDemo(item);
    }

    function closeInfoOverlay() {
      demoRunId += 1;
      hoverBackdrop.classList.remove("show");
      hoverOverlay.classList.remove("show");
      hoverBackdrop.setAttribute("aria-hidden", "true");
      hoverOverlay.setAttribute("aria-hidden", "true");
    }

    function queueCloseInfoOverlay() {
      if (overlayShowTimer) {
        clearTimeout(overlayShowTimer);
      }

      if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
      }
      overlayHideTimer = setTimeout(() => {
        closeInfoOverlay();
      }, 70);
    }

    function queueShowInfo(item) {
      if (overlayShowTimer) {
        clearTimeout(overlayShowTimer);
      }

      if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
      }

      overlayShowTimer = setTimeout(() => {
        showInfo(item);
      }, 220);
    }

    function getDemoOutput(item) {
      if (Array.isArray(item.demoOutput) && item.demoOutput.length > 0) {
        return item.demoOutput;
      }

      return [item.detail];
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function runTerminalDemo(item) {
      demoRunId += 1;
      const runId = demoRunId;
      const commandText = `$ ${item.raw}`;
      const outputLines = getDemoOutput(item);

      for (let i = 0; i <= commandText.length; i += 1) {
        if (runId !== demoRunId) return;
        overlayDemo.textContent = `${commandText.slice(0, i)}█`;
        await sleep(15);
      }

      if (runId !== demoRunId) return;
      overlayDemo.textContent = commandText;

      for (const line of outputLines) {
        if (runId !== demoRunId) return;
        await sleep(110);
        overlayDemo.textContent += `\n${line}`;
      }
    }

    function showCopyToast(message) {
      if (copyToastTimer) {
        clearTimeout(copyToastTimer);
      }
      copyToast.textContent = message;
      copyToast.classList.add("show");
      copyToastTimer = setTimeout(() => {
        copyToast.classList.remove("show");
      }, 1300);
    }

    async function copyText(text) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (error) {
      }

      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);
        return copied;
      } catch (error) {
        return false;
      }
    }

    async function loadCommandDocs() {
      const response = await fetch("./command-docs.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load command-docs.json (${response.status})`);
      }
      return response.json();
    }

    function setActiveFilterButton() {
      const buttons = commandFilters.querySelectorAll(".filter-btn");
      buttons.forEach((button) => {
        const isActive = button.dataset.command === selectedCommand;
        button.classList.toggle("active", isActive);
      });
    }

    function renderCards() {
      grid.innerHTML = "";
      closeInfoOverlay();

      const visibleCards = commandCards.filter((item) => item.command === selectedCommand);

      visibleCards.forEach((item) => {
      const card = document.createElement("article");
      card.className = "option-card";
      card.tabIndex = 0;
      card.innerHTML = `
        <div class="option-name"><code>${item.command}</code> <code>${item.option}</code></div>
      `;

      card.addEventListener("mouseenter", () => queueShowInfo(item));
      card.addEventListener("focus", () => showInfo(item));
      card.addEventListener("mouseleave", () => queueCloseInfoOverlay());
      card.addEventListener("blur", () => queueCloseInfoOverlay());
      card.addEventListener("click", async () => {
        const copied = await copyText(item.raw);
        showCopyToast(copied ? `Copied: ${item.raw}` : "Copy failed");
      });

      grid.appendChild(card);
    });
    }

    function renderFilters() {
      commandFilters.innerHTML = '<span class="filter-label">Commands</span>';

      commands.forEach((command) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-btn";
        button.dataset.command = command;
        button.textContent = command;
        button.addEventListener("click", () => {
          selectedCommand = command;
          setActiveFilterButton();
          renderCards();
        });
        commandFilters.appendChild(button);
      });

      selectedCommand = commands[0] || "";
      setActiveFilterButton();
    }

    async function init() {
      try {
        const commandDocs = await loadCommandDocs();
        commandCards = buildCardsFromDocs(commandDocs);
        commands = [...new Set(commandCards.map((item) => item.command))];
        renderFilters();
        renderCards();
      } catch (error) {
        grid.innerHTML = '<article class="option-card"><div class="option-name"><code>Failed to load command docs</code></div></article>';
        console.error(error);
      }
    }

    init();