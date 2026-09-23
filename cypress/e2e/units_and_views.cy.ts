/// <reference types="cypress" />

describe("Unit Scale Switching & Forecast Views User Journey", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/weather/forecast*", {
      fixture: "forecast.json",
    }).as("getForecast");

    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });

    cy.wait("@getForecast");
  });

  it("toggles temperature scale between Celsius and Fahrenheit and persists in localStorage", () => {
    // Default temperature is Celsius (22°)
    cy.get('[aria-label="Current temperature: 22 degrees"]').should(
      "be.visible",
    );

    // Switch to Fahrenheit
    cy.get('button[aria-label="Fahrenheit scale"]').first().click();
    cy.get('[aria-label="Current temperature: 71.6 degrees"]').should(
      "be.visible",
    );
    cy.window()
      .its("localStorage")
      .invoke("getItem", "hawapani_temp_scale")
      .should("eq", "fahrenheit");

    // Switch back to Celsius
    cy.get('button[aria-label="Celsius scale"]').first().click();
    cy.get('[aria-label="Current temperature: 22 degrees"]').should(
      "be.visible",
    );
    cy.window()
      .its("localStorage")
      .invoke("getItem", "hawapani_temp_scale")
      .should("eq", "celsius");
  });

  it("switches between 24-hour hourly and 7-day extended forecast views", () => {
    // Hourly forecast tab is active by default
    cy.contains('button[role="tab"]', "Hourly (24h)").should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get('section[aria-label="24-Hour Forecast Carousel"]').should(
      "be.visible",
    );

    // Switch to 7-Day Forecast tab
    cy.contains('button[role="tab"]', "7-Day Forecast").click();
    cy.contains('button[role="tab"]', "7-Day Forecast").should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get('section[aria-label="7-Day Extended Forecast"]').should(
      "be.visible",
    );

    // Switch back to Hourly
    cy.contains('button[role="tab"]', "Hourly (24h)").click();
    cy.get('section[aria-label="24-Hour Forecast Carousel"]').should(
      "be.visible",
    );
  });
});
