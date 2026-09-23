/// <reference types="cypress" />

describe("Offline Resiliency & Graceful Degradation User Journey", () => {
  it("hydrates from localStorage and displays high-contrast OfflineBadge when offline with cached forecast", () => {
    cy.fixture("forecast.json").then((mockData) => {
      cy.visit("/", {
        onBeforeLoad(win) {
          // Pre-populate cached forecast
          win.localStorage.setItem(
            "hawapani_forecast_kathmandu",
            JSON.stringify(mockData.data),
          );
          win.localStorage.setItem(
            "hawapani_forecast_last",
            JSON.stringify(mockData.data),
          );
          // Emulate offline browser state
          Object.defineProperty(win.navigator, "onLine", {
            value: false,
            configurable: true,
          });
        },
      });
    });

    // OfflineBadge is rendered with status role and cached timestamp
    cy.get('[role="status"]')
      .should("be.visible")
      .and("contain.text", "Offline Mode — Cached Data")
      .and("contain.text", "📡")
      .and("have.class", "bg-slate-900/90")
      .and("have.class", "text-amber-300");

    // Weather forecast is successfully hydrated from cache
    cy.contains("The current weather in").should("contain.text", "Kathmandu");
    cy.get('[aria-label="Current temperature: 22 degrees"]').should(
      "be.visible",
    );
  });

  it("renders interactive OfflineGame fallback when disconnected without cached forecast", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
        Object.defineProperty(win.navigator, "onLine", {
          value: false,
          configurable: true,
        });
      },
    });

    // Offline fallback region should be visible
    cy.get('[aria-label="Offline Weather Mini-Game"]').should("be.visible");
    cy.contains("You are currently offline").should("be.visible");
    cy.contains("Weather Catcher Mini-Game").should("be.visible");

    // Can start playing the interactive mini-game
    cy.contains("button", "Start Playing 🎮").click();
    cy.get('[aria-label="Player umbrella"]').should("be.visible");
    cy.get('button[aria-label="Move left"]').click();
  });
});
